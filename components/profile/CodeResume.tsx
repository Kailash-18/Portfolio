import { Award, BriefcaseBusiness, GraduationCap } from "lucide-react";
import { experience, education, certifications } from "../../lib/profile/resume";
import "./resume.css";
function Timeline() {
  const [freelance] = experience;
  return (
    <ol className="resume-rail">
      <li>
        <span className="resume-station"><BriefcaseBusiness aria-hidden size={17} /></span>
        <div>
          <p className="resume-meta">{freelance.engagement}</p>
          <h3>{freelance.project}</h3>
          <ul className="resume-impact">
            {freelance.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        </div>
      </li>
      <li>
        <span className="resume-station"><GraduationCap aria-hidden size={18} /></span>
        <div>
          <p className="resume-meta">Aug 2024 – Present</p>
          <h3>{education.degree}</h3>
          <p>{education.institution}</p>
          <p className="resume-small">Expected graduation · {education.expectedGraduation}</p>
        </div>
      </li>
      {certifications.map((certification) => (
        <li key={certification.title}>
          <span className="resume-station"><Award aria-hidden size={18} /></span>
          <div>
            <p className="resume-meta">Certification</p>
            <h3>{certification.title}</h3>
            <p>{certification.issuer}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function CodeResume() {
return <section id="experience" className="resume-section"><header className="resume-heading"><h2>Experience &amp; education</h2></header><div className="resume-panel"><Timeline/></div></section>;
}
