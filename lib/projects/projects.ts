import type { Repo } from "./github";

export type Project = {
  id: string;
  title: string;
  category: string;
  summary: string;
  stack: string[];
  architecture: string;
  challenge: string;
  result: string;
  visual: "cloud" | "pipeline" | "gitops" | "mesh" | "scan" | "repo";
  repoName?: string;
  repo?: Repo;
};

const caseStudies: Project[] = [
  {
    id: "aws", title: "Multi-region AWS infrastructure", category: "Cloud",
    summary: "A three-tier application with independently scaling compute and a private database replicated across AWS regions.",
    stack: ["AWS", "Terraform", "CloudWatch"],
    architecture: "CloudFront routes requests to load-balanced frontend and API tiers. Auto Scaling groups serve each tier, with private MySQL RDS storage in the primary region and a read replica in the secondary region.",
    challenge: "The secondary database needs the primary instance identifier before replication can start. Separate Terraform deployments make the dependency explicit.",
    result: "Three application tiers span two AWS regions. CloudWatch alarms track database health and load-balancer errors.",
    visual: "cloud", repoName: "AWS_Three_Tyre",
  },
  {
    id: "platform", title: "Cloud-native deployment platform", category: "DevOps",
    summary: "A Jenkins delivery pipeline takes applications from build and test through Kubernetes rollout and rollback.",
    stack: ["Jenkins", "Kubernetes", "Terraform"],
    architecture: "Jenkins coordinates builds, tests and container image creation before deploying to Kubernetes. Terraform provisions the underlying infrastructure.",
    challenge: "An unsuccessful rollout needs a recovery path. The deployment workflow includes rollback, with application metrics and logs available for troubleshooting.",
    result: "One pipeline connects build, test, image creation and rollout. Prometheus, Grafana and Splunk support monitoring and log analysis.",
    visual: "pipeline",
  },
  {
    id: "gitops", title: "Kubernetes GitOps pipeline", category: "DevOps",
    summary: "A Git-driven cluster workflow keeps workloads in sync with versioned Helm configurations.",
    stack: ["Helm", "Argo CD", "Kubernetes"],
    architecture: "Helm packages application resources. Argo CD reconciles the cluster with its Git configuration, while namespaces, persistent volumes and RBAC define workload boundaries.",
    challenge: "Configuration drift and access control complicate shared clusters. Git-based reconciliation and scoped permissions keep configuration changes traceable.",
    result: "Cluster configuration, application packaging and access rules are versioned alongside a monitoring stack built with Prometheus, Grafana and Alertmanager.",
    visual: "gitops",
  },

];

const documentedRepos: Record<string, Omit<Project, "id" | "repo" | "repoName">> = {
  polygen: {
    title: "PolyGen", category: "AI tools", stack: ["Python", "FastAPI", "Three.js"], visual: "mesh",
    summary: "A text-to-3D asset pipeline with mesh optimization, PBR textures and a WebGL inspection view.",
    architecture: "The pipeline separates geometry generation, mesh reduction and texture synthesis. A WebGL viewer lets artists inspect the resulting asset before export.",
    challenge: "Generated geometry needs smaller meshes and materials that work in a game engine. The workflow pairs model output with mesh processing and UV parameterization.",
    result: "The project supports GLB and OBJ export for downstream asset workflows.",
  },
  omnisight: {
    title: "OmniSight", category: "AI tools", stack: ["Python", "Playwright", "React"], visual: "scan",
    summary: "A visual QA tool that pairs browser screenshots with DOM evidence to find layout defects.",
    architecture: "Playwright collects screenshots and DOM snapshots at mobile and desktop sizes. A vision-language model reviews them, and a dashboard surfaces before-and-after evidence.",
    challenge: "Selector checks can pass even when a button is clipped or obscured. Examining the rendered page catches the visual consequence.",
    result: "Proposed CSS fixes are retested in isolation and presented for human review in a pull request.",
  },
};

export function getProjects(repos: Repo[]): Project[] {
  const attached = caseStudies.map(project => ({ ...project, repo: repos.find(repo => repo.name.toLowerCase() === project.repoName?.toLowerCase()) }));
  const additional = repos.filter(repo => !repo.fork && repo.name.toLowerCase() !== "kailash-18" && !attached.some(project => project.repo?.name === repo.name));
  additional.sort((a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at));
  return [...attached, ...additional.map((repo): Project => {
    const documented = documentedRepos[repo.name.toLowerCase()];
    if (documented) return { ...documented, id: repo.name, repo };
    return {
      id: repo.name, title: repo.name, repo, category: repo.language ?? "Open source",
      summary: repo.description || "An open-source project from Kailash’s GitHub.",
      stack: [repo.language, ...repo.topics].filter((tag): tag is string => Boolean(tag)).slice(0, 4),
      visual: "repo", architecture: "", challenge: "", result: "",
    };
  })];
}
