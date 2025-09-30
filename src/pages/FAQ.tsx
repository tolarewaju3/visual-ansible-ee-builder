import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const FAQ = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">FAQ & Troubleshooting</h1>
        <p className="text-muted-foreground">Common issues and solutions for building Ansible Execution Environments</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              registry.redhat.io pull fails
            </CardTitle>
            <CardDescription>Error when pulling images from Red Hat registry</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Run <code className="bg-muted px-2 py-1 rounded">podman login registry.redhat.io</code> on your build machine before attempting the build.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Missing Python at build
            </CardTitle>
            <CardDescription>Build fails due to missing Python installation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Use the <strong>UBI Python 3.11</strong> base image, or install Python in your custom Containerfile.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              dnf vs microdnf confusion
            </CardTitle>
            <CardDescription>Package manager not found during RPM installation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              UBI minimal images use <code className="bg-muted px-2 py-1 rounded">microdnf</code>, while standard UBI/AAP images use <code className="bg-muted px-2 py-1 rounded">dnf</code>. The builder detects this automatically.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Custom base image quirks
            </CardTitle>
            <CardDescription>Issues with non-RHEL base images</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Non-RHEL based images may not support RPM installs. Consider using UBI-based images for best compatibility with ansible-builder.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need more help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              For additional support, use the "Report Problem" feature in your profile menu, or consult the{" "}
              <a 
                href="https://ansible.readthedocs.io/projects/builder/en/latest/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ansible-builder documentation
              </a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;