import subprocess
import os

scenes = [
    {
        "title": "PraxisMD Family Physician EHR",
        "subtitle": "Clinical Platform Overview & Architecture",
        "badge": "COMPREHENSIVE PRIMARY CARE EHR",
        "color": "0x111827", # slate-900
        "accent": "0xb91c1c", # red-700
        "text": "Welcome to PraxisMD Family Physician EHR, an electronic health record engineered for clinical precision and primary care workflows.",
        "duration": 9
    },
    {
        "title": "Role-Based Staff Authorization",
        "subtitle": "Doctor, Compounder, Lab Tech & Super Admin Governance",
        "badge": "SECURITY & ACCESS CONTROL",
        "color": "0x1e1b4b", # indigo-950
        "accent": "0x7c3aed", # purple-600
        "text": "The platform enforces strict role-based authorization with custom workflows for Attending Doctors, Clinical Compounders, Diagnostic Lab Technicians, and a Super User Admin.",
        "duration": 12
    },
    {
        "title": "Patient Directory & Webcam Avatars",
        "subtitle": "Triage Priority, Search & 1:1 Live Photo Intake",
        "badge": "PATIENT DOSSIER & INTAKE",
        "color": "0x0f172a", # slate-900
        "accent": "0x0284c7", # sky-600
        "text": "Quickly search patient charts, track emergency triage priorities, and capture instant patient identification photos with the integrated webcam or clinical avatar presets.",
        "duration": 11
    },
    {
        "title": "The SOAP Clinical Room",
        "subtitle": "ICD-10 Coders, Vitals Trends & Note Finalization",
        "badge": "CLINICAL ENCOUNTER SUITE",
        "color": "0x1e293b", # slate-800
        "accent": "0xb91c1c", # red-700
        "text": "Document patient encounters with streamlined SOAP notes, ICD-10 coders, live vitals analytics, e-prescriptions, and physician-restricted encounter signature governance.",
        "duration": 11
    },
    {
        "title": "Diagnostics & Growth Charts",
        "subtitle": "Lab Panels, Critical Flags & WHO Pediatric Curves",
        "badge": "LABORATORY & PEDIATRICS",
        "color": "0x064e3b", # emerald-950
        "accent": "0x059669", # emerald-600
        "text": "Lab technicians manage hematology and metabolic panels with critical value flags, while clinicians monitor child percentiles using interactive pediatric growth curves.",
        "duration": 12
    },
    {
        "title": "Patient Summary & Mobile QR",
        "subtitle": "After-Visit Care Plans & Encrypted Mobile Portal",
        "badge": "PATIENT EMPOWERMENT",
        "color": "0x18181b", # zinc-900
        "accent": "0xd97706", # amber-600
        "text": "Print official After-Visit Summaries or generate instant QR codes, empowering patients to scan and review their discharge plans and prescriptions on their mobile devices.",
        "duration": 11
    }
]

os.makedirs("public", exist_ok=True)
os.makedirs("/tmp/ehr_demo_parts", exist_ok=True)

part_files = []

for idx, scene in enumerate(scenes):
    audio_file = f"/tmp/ehr_demo_parts/audio_{idx}.wav"
    video_file = f"/tmp/ehr_demo_parts/part_{idx}.mp4"
    
    # 1. Generate male voice audio with flite voice=rms (male)
    escaped_text = scene["text"].replace("'", "")
    cmd_audio = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"flite=text='{escaped_text}':voice=rms",
        "-ar", "44100",
        "-ac", "2",
        audio_file
    ]
    subprocess.run(cmd_audio, check=True)
    
    # Measure audio duration
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", audio_file],
        capture_output=True, text=True, check=True
    )
    dur = float(probe.stdout.strip()) + 1.2
    
    # 2. Generate video slide with title, subtitle, and badge overlay
    t_title = scene["title"].replace(":", "\\:").replace("'", "")
    t_sub = scene["subtitle"].replace(":", "\\:").replace("'", "")
    t_badge = scene["badge"].replace(":", "\\:").replace("'", "")
    
    filter_complex = (
        f"color=c={scene['color']}:s=1280x720:d={dur} [bg]; "
        f"[bg] drawbox=x=80:y=60:w=1120:h=600:color={scene['accent']}@0.15:t=fill [box1]; "
        f"[box1] drawbox=x=80:y=60:w=1120:h=6:color={scene['accent']}:t=fill [line]; "
        f"[line] drawbox=x=110:y=100:w=360:h=34:color={scene['accent']}:t=fill [badge_box]; "
        f"[badge_box] drawtext=text='{t_badge}':fontcolor=white:fontsize=15:x=125:y=110 [txt_badge]; "
        f"[txt_badge] drawtext=text='{t_title}':fontcolor=white:fontsize=44:x=110:y=170 [txt_title]; "
        f"[txt_title] drawtext=text='{t_sub}':fontcolor=0x94a3b8:fontsize=22:x=110:y=235 [txt_sub]; "
        f"[txt_sub] drawbox=x=110:y=285:w=1060:h=2:color=0x334155:t=fill [divider]; "
        f"[divider] drawbox=x=110:y=320:w=1060:h=250:color=0x0f172a@0.8:t=fill [content_box]; "
        f"[content_box] drawbox=x=110:y=320:w=1060:h=250:color={scene['accent']}@0.4:t=2 [content_border]; "
        f"[content_border] drawtext=text='VOICE OVER NARRATION \\(MALE\\)':fontcolor={scene['accent']}:fontsize=14:x=140:y=350 [nar_label]; "
        f"[nar_label] drawtext=text='{scene['text'][:70]}':fontcolor=white:fontsize=20:x=140:y=395 [line1]; "
        f"[line1] drawtext=text='{scene['text'][70:140]}':fontcolor=white:fontsize=20:x=140:y=435 [line2]; "
        f"[line2] drawtext=text='{scene['text'][140:]}':fontcolor=white:fontsize=20:x=140:y=475 [line3]; "
        f"[line3] drawtext=text='Scene {idx+1} of 6  |  PraxisMD Family Physician EHR Interactive Walkthrough':fontcolor=0x64748b:fontsize=14:x=110:y=625"
    )
    
    cmd_vid = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", filter_complex,
        "-i", audio_file,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        video_file
    ]
    subprocess.run(cmd_vid, check=True)
    part_files.append(video_file)

# Concatenate all parts into final public MP4 video
concat_list_path = "/tmp/ehr_demo_parts/concat.txt"
with open(concat_list_path, "w") as f:
    for pf in part_files:
        f.write(f"file '{pf}'\n")

final_output = "public/family-physician-ehr-demo.mp4"
cmd_concat = [
    "ffmpeg", "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_list_path,
    "-c", "copy",
    final_output
]
subprocess.run(cmd_concat, check=True)
print(f"Demo video successfully generated at {final_output}")
