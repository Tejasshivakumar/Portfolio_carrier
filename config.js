const config = {
  name: "Tejas Shiva Kumar",
  initials: "TSK",
  title: "Software Engineer & AI/ML Researcher",
  location: "Dublin, Ireland",
  email: "tejasshivakumar104@gmail.com",
  phone: "+353 894 895 290",
  resume: "./Resume/TEJAS_SHIVA_KUMAR_RESUME.pdf",

  taglines: [
    "Backend Systems",
    "AI/ML Solutions",
    "Data-Driven Applications",
    "Scalable Software",
  ],

  bio: `Software Engineer with professional experience in .NET/C# and SQL Server, now pursuing an MSc in Computing (Data Analytics) at Dublin City University. My practicum research applies Graph Neural Networks to spatial road crack analysis, a blend of computer vision, graph ML, and applied research. I bring production-grade engineering discipline to AI problems and am actively targeting roles in backend engineering, AI/ML, and software engineering.`,

  social: {
    github:   "https://github.com/Tejasshivakumar",
    linkedin: "https://www.linkedin.com/in/tejas-shiva-kumar-51940a24b",
    leetcode: "https://leetcode.com/u/tejasshivakumar2001/",
    gfg:      "https://www.geeksforgeeks.org/user/tejasshivactle/",
  },

  aboutStats: [
    { value: "1+",   label: "Years Experience" },
    { value: "10+",  label: "Projects Built"   },
    { value: "50+",  label: "LeetCode Streak"  },
    { value: "MSc",  label: "DCU Ireland"      },
  ],

  experience: [
    {
      type:     "education",
      role:     "MSc in Computing (Data Analytics)",
      org:      "Dublin City University",
      location: "Dublin, Ireland",
      period:   "Sept 2025 – Sept 2026",
      current:  true,
      desc:     "Advanced coursework in Data Analytics, Statistical Methods, Cloud & Distributed Systems, and Research Methods. Practicum: GNN-based pipeline for spatial analysis of road crack segmentation and propagation prediction.",
      tags:     ["Python", "PyTorch", "GNN", "Data Analytics", "Research"],
    },
    {
      type:     "work",
      role:     "Software Engineer Trainee",
      org:      "AceMicromatic Manufacturing Intelligence Technologies",
      location: "Bengaluru, India",
      period:   "Aug 2023 – May 2024",
      current:  false,
      desc:     "Developed and maintained ASP.NET web applications using C#, JavaScript, Bootstrap, and SQL Server. Led UI/UX redesign of an internal dashboard, optimised SQL stored procedures, and resolved critical production bugs. Recognised by management for client communication and delivery.",
      tags:     ["ASP.NET", "C#", "SQL Server", "JavaScript", "Bootstrap"],
    },
    {
      type:     "education",
      role:     "BE in Information Science & Engineering",
      org:      "Visveswaraya Technological University",
      location: "India",
      period:   "Aug 2019 – Jun 2023",
      current:  false,
      desc:     "CGPA: 7.76 (1:1 Level). Core study: Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, Web Technologies, Java and Python programming.",
      tags:     ["DSA", "DBMS", "Java", "Python", "Computer Networks"],
    },
    {
      type:     "internship",
      role:     "AI & ML Intern",
      org:      "IBM SkillsBuild / Edunet Foundation",
      location: "Bengaluru, India",
      period:   "Sept 2022 – Nov 2022",
      current:  false,
      desc:     "8-week internship focused on AI-based Sign Language Recognition. Hands-on ML and computer vision under IBM mentorship, working on real-world accessibility use cases.",
      tags:     ["Machine Learning", "Computer Vision", "Python", "IBM"],
    },
  ],

  skillCategories: [
    {
      category: "Languages",
      icon: "fa-code",
      skills: ["Python", "C#", "Java", "SQL", "JavaScript", "HTML5", "CSS3"],
    },
    {
      category: "Backend & Frameworks",
      icon: "fa-server",
      skills: ["ASP.NET", "Spring Boot", "MVC", "REST APIs"],
    },
    {
      category: "AI / ML & Deep Learning",
      icon: "fa-brain",
      skills: ["PyTorch", "PyTorch Geometric", "OpenCV", "scikit-learn", "SAM2", "NetworkX"],
    },
    {
      category: "Graph Neural Networks",
      icon: "fa-diagram-project",
      skills: ["GCN", "GraphSAGE", "GraphUNet", "Link Prediction", "Skeletonization (sknw)"],
    },
    {
      category: "Databases",
      icon: "fa-database",
      skills: ["MSSQL", "MySQL", "PostgreSQL", "SQL Server"],
    },
    {
      category: "Tools & Platforms",
      icon: "fa-wrench",
      skills: ["Git / GitHub", "PyCharm", "Visual Studio", "Google Colab", "Apple MPS (M4)"],
    },
  ],

  projects: [
    {
      featured: true,
      title:    "GNN Road Crack Segmentation & Propagation",
      subtitle: "MSc Practicum Research",
      period:   "Nov 2025 – Present",
      desc:     "End-to-end pipeline for road pavement distress analysis using Graph Neural Networks. Three-phase architecture: hybrid U-Net + GCN segmentation, morphological skeletonization to graph conversion via sknw, and GraphSAGE link prediction for crack propagation forecasting. Includes a hybrid dataset labelling strategy using SAM2 and CrackDataset ground-truth masks with IoU ≥ 0.80 auto-acceptance.",
      tags:     ["Python", "PyTorch", "PyTorch Geometric", "OpenCV", "SAM2", "NetworkX", "GraphSAGE"],
      github:   "https://github.com/Tejasshivakumar",
      status:   "In Progress",
      gradient: "135deg, #0f0c29, #302b63, #24243e",
    },
    {
      featured: false,
      title:    "Visitor Management System",
      subtitle: "Enterprise Web Application",
      period:   "Oct 2024",
      desc:     "Secure web-based system digitising visitor registration, check-in/out, and host notification workflows. Role-based access for staff/employees/admins, automated email alerts, real-time security dashboard, SQL Server stored procedures with data encryption, and automated Excel report generation for compliance.",
      tags:     ["ASP.NET", "C#", "SQL Server", "JavaScript", "Bootstrap"],
      github:   "",
      status:   "Completed",
      gradient: "135deg, #1a1a2e, #16213e, #0f3460",
    },
    {
      featured: false,
      title:    "Pharmacy Management System",
      subtitle: "Python Automation",
      period:   "2023",
      desc:     "Python-based system managing customer purchases, products, and orders. Features a reward points and discount engine, CSV/file storage, and automatic updates to customer, product, and order records.",
      tags:     ["Python", "CSV", "File Handling", "OOP"],
      github:   "",
      status:   "Completed",
      gradient: "135deg, #0a1628, #0d3b2e, #1a4d2e",
    },
    {
      featured: false,
      title:    "Smart Education Platform",
      subtitle: "Full-Stack Web App",
      period:   "2023",
      desc:     "Interactive platform for real-time student-teacher interaction with a personalised Q&A system, course recommendation engine, and admin dashboard for institutional management.",
      tags:     ["Python", "MySQL", "Backend", "REST API"],
      github:   "",
      status:   "Completed",
      gradient: "135deg, #1a0533, #2d1b69, #11998e",
    },
  ],

  hackathons: [
    {
      result:  "winner",
      title:   "AI Movie Making Challenge",
      org:     "Dublin, Ireland",
      year:    "2025",
      desc:    "Won the AI Movie Making Challenge in Dublin. Collaborated cross-functionally to script, generate, and edit an AI-driven short film using multiple GenAI tools within a 4-hour deadline.",
    },
    {
      result:  "finalist",
      title:   "Colosseum Hackathon — Solana",
      org:     "Colosseum / Solana Ecosystem",
      year:    "2026",
      desc:    "Placed Top 15 in a highly competitive global hackathon on the Solana blockchain. Delivered a full pitch with product vision, technical architecture, and go-to-market strategy.",
    },
  ],

  certifications: [
    {
      title: "NPTEL Elite Certificate — Python, DSA",
      org:   "IIT Madras (NPTEL)",
      year:  "2023",
      link:  "https://drive.google.com/file/d/1e-c32gQNeFbH3wAjfErXRpJmpHX6T6K4/view?usp=sharing",
    },
    {
      title: "Python Programming Masterclass",
      org:   "Udemy",
      year:  "2022",
      link:  "https://drive.google.com/file/d/1kc8i8HQdBZ5Iz8Nn00Pr4BGYvAguLDYe/view?usp=sharing",
    },
    {
      title: "IBM SkillsBuild AI & ML Certificate",
      org:   "IBM / AICTE / Edunet Foundation",
      year:  "2022",
      link:  "",
    },
    {
      title: "LeetCode 50-Day Streak Badge",
      org:   "LeetCode",
      year:  "2024",
      link:  "https://leetcode.com/u/tejasshivakumar2001/",
    },
  ],
};
