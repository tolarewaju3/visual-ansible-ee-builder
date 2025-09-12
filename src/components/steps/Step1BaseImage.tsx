import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Container, Zap } from "lucide-react";

interface BaseImage {
  id: string;
  name: string;
  tag: string;
  description: string;
  popular?: boolean;
  fastStart?: boolean;
}

const popularBaseImages: BaseImage[] = [
  {
    id: "python-311",
    name: "registry.access.redhat.com/ubi9/python-311",
    tag: "latest",
    description: "Red Hat Universal Base Image 9 w/ Python",
    fastStart: true,
  },
  {
    id: "ee-minimal-rhel9",
    name: "registry.redhat.io/ansible-automation-platform-25/ee-minimal-rhel9",
    tag: "latest",
    description: "Red Hat Ansible Minimal EE base (RHEL 9)",
  },
];

interface Step1BaseImageProps {
  selectedBaseImage: string;
  onBaseImageChange: (baseImage: string) => void;
}

export function Step1BaseImage({ selectedBaseImage, onBaseImageChange }: Step1BaseImageProps) {
  const handleImageSelect = (imageId: string) => {
    const image = popularBaseImages.find(img => img.id === imageId);
    if (image) {
      onBaseImageChange(`${image.name}:${image.tag}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Container className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-2xl font-bold">Select Base Container Image</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose a base image for your Ansible Execution Environment. 
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Base Images</CardTitle>
          <CardDescription>
            Select from commonly used base images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={popularBaseImages.find(img => `${img.name}:${img.tag}` === selectedBaseImage)?.id || ""}
            onValueChange={(value) => {
              handleImageSelect(value);
            }}
            className="space-y-3"
          >
            {popularBaseImages.map((image) => (
              <div key={image.id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={image.id} className="mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {image.name}:{image.tag}
                    </code>
                    {image.fastStart && (
                      <Badge variant="default" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Fast Start
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{image.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}