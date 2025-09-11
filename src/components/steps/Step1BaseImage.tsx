import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Container } from "lucide-react";

interface BaseImage {
  id: string;
  name: string;
  tag: string;
  description: string;
  size: string;
  popular?: boolean;
}

const popularBaseImages: BaseImage[] = [
  {
    id: "ubi8",
    name: "registry.redhat.io/ubi8/ubi",
    tag: "latest",
    description: "Red Hat Universal Base Image 8 - Recommended for production",
    size: "234 MB",
    popular: true,
  },
  {
    id: "ubi9",
    name: "registry.redhat.io/ubi9/ubi",
    tag: "latest", 
    description: "Red Hat Universal Base Image 9 - Latest stable release",
    size: "189 MB",
    popular: true,
  },
  {
    id: "minimal-ubi8",
    name: "registry.redhat.io/ubi8/ubi-minimal",
    tag: "latest",
    description: "Minimal UBI8 image with reduced footprint",
    size: "103 MB",
    popular: true,
  },
  {
    id: "fedora",
    name: "fedora",
    tag: "latest",
    description: "Latest Fedora Linux distribution",
    size: "197 MB",
  },
  {
    id: "centos",
    name: "centos",
    tag: "stream9",
    description: "CentOS Stream 9 - Community distribution",
    size: "156 MB",
  },
  {
    id: "ubuntu",
    name: "ubuntu",
    tag: "22.04",
    description: "Ubuntu 22.04 LTS - Long term support",
    size: "77 MB",
  },
];

interface Step1BaseImageProps {
  selectedBaseImage: string;
  onBaseImageChange: (baseImage: string) => void;
}

export function Step1BaseImage({ selectedBaseImage, onBaseImageChange }: Step1BaseImageProps) {
  const [customImage, setCustomImage] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const handleImageSelect = (imageId: string) => {
    const image = popularBaseImages.find(img => img.id === imageId);
    if (image) {
      onBaseImageChange(`${image.name}:${image.tag}`);
      setUseCustom(false);
    }
  };

  const handleCustomImageChange = (value: string) => {
    setCustomImage(value);
    onBaseImageChange(value);
    setUseCustom(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Container className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-2xl font-bold">Select Base Container Image</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the foundation container image for your Ansible Execution Environment. 
          Red Hat UBI images are recommended for production workloads.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Base Images</CardTitle>
          <CardDescription>
            Select from commonly used base images or specify a custom one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={useCustom ? "custom" : popularBaseImages.find(img => `${img.name}:${img.tag}` === selectedBaseImage)?.id || ""}
            onValueChange={(value) => {
              if (value === "custom") {
                setUseCustom(true);
                onBaseImageChange(customImage);
              } else {
                handleImageSelect(value);
              }
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
                    {image.popular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{image.size}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{image.description}</p>
                </div>
              </div>
            ))}

            {/* Custom Image Option */}
            <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="custom" className="mt-1" />
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-sm font-medium">Custom Base Image</Label>
                  <p className="text-xs text-muted-foreground">Specify your own container image</p>
                </div>
                <Input
                  placeholder="e.g., my-registry.com/my-image:latest"
                  value={customImage}
                  onChange={(e) => handleCustomImageChange(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}