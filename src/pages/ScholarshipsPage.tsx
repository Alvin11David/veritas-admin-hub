import { Calendar, ExternalLink, GraduationCap, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ScholarshipLink = {
  title: string;
  description: string;
  amount: string;
  deadline: string;
  url: string;
  status: "Open" | "Closing Soon" | "Closed";
};

const scholarships: ScholarshipLink[] = [
  {
    title: "Merit Excellence Scholarship",
    description:
      "For high-achieving incoming and continuing students with strong academic records.",
    amount: "Up to $5,000",
    deadline: "2026-05-31",
    url: "https://example.edu/scholarships/merit-excellence",
    status: "Open",
  },
  {
    title: "Community Leadership Grant",
    description:
      "Supports students who demonstrate leadership in service, clubs, and outreach programs.",
    amount: "$2,500",
    deadline: "2026-05-10",
    url: "https://example.edu/scholarships/community-leadership",
    status: "Closing Soon",
  },
  {
    title: "STEM Future Scholars Award",
    description:
      "A scholarship for students pursuing science, technology, engineering, or mathematics degrees.",
    amount: "Up to $7,500",
    deadline: "2026-04-01",
    url: "https://example.edu/scholarships/stem-future",
    status: "Closed",
  },
];

function formatDeadline(deadline: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(deadline));
}

function isPastDeadline(deadline: string) {
  return new Date(deadline).getTime() < new Date("2026-04-14T00:00:00").getTime();
}

export default function ScholarshipsPage() {
  const openScholarships = scholarships.filter((item) => !isPastDeadline(item.deadline));
  const nextDeadline = openScholarships.sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  )[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                Scholarships
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Scholarship Opportunities
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Share active scholarship links with clear deadlines so applicants know exactly when to apply.
              </p>
            </div>

            {nextDeadline ? (
              <div className="rounded-lg border border-primary/20 bg-background/80 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Next deadline</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {nextDeadline.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDeadline(nextDeadline.deadline)}
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/80 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-4 w-4 text-primary" /> Active Scholarship Links
            </CardTitle>
            <CardDescription>
              Each link includes its deadline so students can apply before the window closes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scholarships.map((scholarship) => {
              const expired = isPastDeadline(scholarship.deadline);

              return (
                <div
                  key={scholarship.title}
                  className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {scholarship.title}
                        </h3>
                        <Badge
                          variant={
                            scholarship.status === "Closed"
                              ? "secondary"
                              : scholarship.status === "Closing Soon"
                                ? "destructive"
                                : "default"
                          }
                          className={
                            scholarship.status === "Closing Soon"
                              ? "bg-amber-500/15 text-amber-700 border-amber-200"
                              : ""
                          }
                        >
                          {expired ? "Closed" : scholarship.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {scholarship.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          Deadline: {formatDeadline(scholarship.deadline)}
                        </span>
                        <span className="font-medium text-foreground">
                          Award: {scholarship.amount}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:min-w-40 md:items-end">
                      <Button asChild disabled={expired} className="w-full md:w-auto">
                        <a
                          href={expired ? undefined : scholarship.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-disabled={expired}
                          tabIndex={expired ? -1 : 0}
                          onClick={(event) => {
                            if (expired) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                          {expired ? "Deadline Passed" : "Apply Now"}
                        </a>
                      </Button>
                      <p className="text-xs text-muted-foreground text-right">
                        {expired
                          ? "This opportunity is no longer accepting applications."
                          : "Applications remain open until the listed deadline."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-4 w-4 text-primary" /> Deadline Reminder
            </CardTitle>
            <CardDescription>
              Keep the scholarship link visible until the deadline expires.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The top application link now includes a deadline badge, and expired links are disabled automatically.
            </p>
            <p>
              You can update the URL and deadline values in this page whenever a scholarship cycle changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}