/** Professional information transcribed from the two supplied résumés. */
export const profile = {
  name: "Kailash Ambadipudi",
  focus: "Multi-cloud and DevOps engineering",
  email: "ambadipudikailash@gmail.com",
  github: "https://github.com/Kailash-18",
  linkedin: "https://www.linkedin.com/in/kailash-ambadipudi-b9235831a/",
  resume: "/resume",
};

export const education = {
  degree: "B.Tech in Electronics and Communication Engineering",
  institution: "Indian Institute of Information Technology Bhagalpur",
  start: "August 2024",
  expectedGraduation: "May 2028",
};

export const experience = [
  {
    project: "AWS infrastructure for a three-tier web app",
    engagement: "Freelance project",
    highlights: [
      "Separated the web frontend, application servers and database so each tier could be managed independently.",
      "Routed traffic through a load balancer to an Auto Scaling group and kept RDS in private subnets.",
      "Defined the deployment in Terraform and used CloudWatch to track its health.",
    ],
    tools: ["AWS", "Terraform", "CloudWatch"],
  },
];

export const certifications = [
  { title: "DevOps Engineering Certification", issuer: "Priyogop" },
];

export const skillGroups = [
  { category: "Cloud platforms", skills: ["AWS", "Microsoft Azure", "Google Cloud Platform"] },
  { category: "AWS services", skills: ["EC2", "VPC", "IAM", "S3", "RDS", "Route 53", "CloudFront", "Auto Scaling", "Application Load Balancer", "EKS", "ECR", "Lambda", "CloudWatch", "AWS Certificate Manager"] },
  { category: "CI/CD", skills: ["Jenkins", "GitHub Actions", "GitLab CI/CD", "Argo CD", "GitOps"] },
  { category: "Containers & orchestration", skills: ["Docker", "Docker Compose", "Kubernetes", "Helm", "Amazon EKS"] },
  { category: "Infrastructure as code", skills: ["Terraform modules", "Terraform remote state", "Terraform workspaces", "Ansible playbooks", "Ansible roles", "Ansible inventory"] },
  { category: "Version control", skills: ["Git", "GitHub", "GitLab", "Git Flow", "Feature branching", "Pull requests", "Code reviews"] },
  { category: "Networking", skills: ["VPC design", "Public and private subnets", "NAT Gateway", "Internet Gateway", "Route tables", "Security groups", "Network ACLs", "DNS", "Load balancers"] },
  { category: "Networking study", skills: ["Public and private IP addressing", "Subnet boundaries", "Routing", "OSI model", "TCP and UDP"] },
  { category: "Network tools", skills: ["OPNsense", "Wireshark", "Nmap", "Tenable Nessus", "PowerShell", "Traceroute"] },
  { category: "Security tools", skills: ["Metasploit Framework", "Burp Suite", "OWASP Juice Shop", "Ettercap", "VirtualBox"] },
  { category: "Monitoring & logging", skills: ["Prometheus", "Grafana", "Splunk", "ELK Stack", "CloudWatch", "Alertmanager"] },
  { category: "Security", skills: ["IAM roles and policies", "RBAC", "Secrets management", "SSL/TLS", "Network security"] },
  { category: "Build & web servers", skills: ["Maven", "SonarQube", "Apache Tomcat", "Nginx", "JFrog"] },
  { category: "Programming & systems", skills: ["Python", "C", "C++", "Bash", "Linux", "Problem solving", "Object-oriented programming", "Encapsulation", "Inheritance", "Polymorphism", "Abstraction", "Microservices", "High availability", "Disaster recovery"] },
  { category: "Data & communication", skills: ["Amazon RDS", "SQL fundamentals", "REST", "UDP"] },
  { category: "Computer vision & hardware", skills: ["OpenCV", "MediaPipe", "Raspberry Pi 4", "GPIO", "L298N motor driver"] },
];
