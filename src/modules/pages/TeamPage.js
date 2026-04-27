import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent } from "../../components/ui/card";
import { Github, Twitter, Linkedin } from "lucide-react";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Pages" },
  { label: "Team" },
];

const AVATAR_COLORS = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
  "bg-cyan-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
];

const TEAM_MEMBERS = [
  { name: "Alexandra Chen", initials: "AC", role: "CEO & Co-Founder", bio: "Visionary leader with 15+ years in enterprise software and a passion for building tools that empower teams." },
  { name: "Marcus Rivera", initials: "MR", role: "CTO & Co-Founder", bio: "Full-stack architect who believes in clean code, scalable systems, and open-source collaboration." },
  { name: "Sophia Patel", initials: "SP", role: "Lead Designer", bio: "Award-winning designer focused on creating intuitive and beautiful user experiences for complex applications." },
  { name: "James O'Brien", initials: "JO", role: "Frontend Developer", bio: "React enthusiast and accessibility advocate who builds responsive, performant web applications." },
  { name: "Elena Kowalski", initials: "EK", role: "Backend Developer", bio: "Distributed systems engineer with expertise in Node.js, microservices, and database optimization." },
  { name: "David Kim", initials: "DK", role: "DevOps Engineer", bio: "Cloud infrastructure specialist ensuring 99.99% uptime through robust CI/CD pipelines and monitoring." },
  { name: "Rachel Nguyen", initials: "RN", role: "QA Lead", bio: "Quality champion who implements comprehensive testing strategies from unit tests to end-to-end automation." },
  { name: "Thomas Wright", initials: "TW", role: "Product Manager", bio: "Customer-centric product leader who bridges the gap between user needs and technical possibilities." },
];

export default function TeamPage() {
  return (
    <div>
      <Breadcrumb title="Team" items={BREADCRUMB_ITEMS} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Meet Our Team</h2>
        <p className="text-muted-foreground">The talented people behind Admin Platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEAM_MEMBERS.map((member, i) => (
          <Card key={member.name} className="text-center">
            <CardContent className="p-6">
              <div
                className={`w-20 h-20 rounded-full ${AVATAR_COLORS[i]} text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4`}
              >
                {member.initials}
              </div>
              <h4 className="font-bold text-lg">{member.name}</h4>
              <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
              <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
              <div className="flex items-center justify-center gap-3">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
