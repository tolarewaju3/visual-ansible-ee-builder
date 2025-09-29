import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container, Zap, Lock, CheckCircle } from "lucide-react";
import { useState } from "react";

interface BaseImage {
  id: string;
  name: string;
  tag: string;
  description: string;
  popular?: boolean;
  fastStart?: boolean;
  subscriptionRequired?: boolean;
  supported?: boolean;
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
    subscriptionRequired: true,
    supported: true,
  },
];

interface Step1BaseImageProps {
  selectedBaseImage: string;
  onBaseImageChange: (baseImage: string) => void;
  redhatCredentials?: { username: string; password: string };
  onRedhatCredentialsChange?: (credentials: { username: string; password: string } | undefined) => void;
}

const isValidContainerImage = (image: string): boolean => {
  // Regex to validate container image format: [registry[:port]/]namespace/name[:tag]
  const imagePattern = /^(?:(?:[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})?(?::[0-9]+)?\/)?(?:[a-zA-Z0-9._-]+\/)*)?[a-zA-Z0-9._-]+(?::[a-zA-Z0-9._-]+)?$/;
  return imagePattern.test(image.trim());
};

export function Step1BaseImage({ 
  selectedBaseImage, 
  onBaseImageChange, 
  redhatCredentials,
  onRedhatCredentialsChange 
}: Step1BaseImageProps) {
  const [customImage, setCustomImage] = useState("");
  const [isCustomSelected, setIsCustomSelected] = useState(false);

  // Check if current selection is a custom image (not in popular images list)
  const isCurrentCustom = !popularBaseImages.some(img => `${img.name}:${img.tag}` === selectedBaseImage);
  
  // Check if Red Hat Ansible Minimal EE is selected
  const isRedHatSelected = selectedBaseImage.includes('registry.redhat.io/ansible-automation-platform-25/ee-minimal-rhel9');

  const handleImageSelect = (value: string) => {
    if (value === "custom") {
      setIsCustomSelected(true);
      if (customImage.trim() && isValidContainerImage(customImage)) {
        onBaseImageChange(customImage);
      }
      // Clear Red Hat credentials when switching away from Red Hat image
      if (onRedhatCredentialsChange) {
        onRedhatCredentialsChange(undefined);
      }
    } else {
      setIsCustomSelected(false);
      const image = popularBaseImages.find(img => img.id === value);
      if (image) {
        onBaseImageChange(`${image.name}:${image.tag}`);
        
        // Clear credentials when switching away from Red Hat image
        if (value !== "ee-minimal-rhel9" && onRedhatCredentialsChange) {
          onRedhatCredentialsChange(undefined);
        }
      }
    }
  };

  const handleCustomImageChange = (value: string) => {
    setCustomImage(value);
    if (isCustomSelected && value.trim() && isValidContainerImage(value)) {
      onBaseImageChange(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Base Images</CardTitle>
            <CardDescription>
              Select from commonly used base images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={isCurrentCustom || isCustomSelected ? "custom" : (popularBaseImages.find(img => `${img.name}:${img.tag}` === selectedBaseImage)?.id || "")}
              onValueChange={handleImageSelect}
              className="space-y-3"
            >
              {popularBaseImages.map((image) => (
                <div key={image.id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={image.id} className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{image.description}</span>
                      {image.fastStart && (
                        <Badge variant="default" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Fast Start
                        </Badge>
                      )}
                      {image.subscriptionRequired && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Subscription
                        </Badge>
                      )}
                      {image.supported && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Supported
                        </Badge>
                      )}
                    </div>
                     <code className="text-sm font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                       {image.name}:{image.tag}
                     </code>
                     
                     {/* Red Hat Credentials Fields */}
                     {image.id === "ee-minimal-rhel9" && 
                      popularBaseImages.find(img => `${img.name}:${img.tag}` === selectedBaseImage)?.id === "ee-minimal-rhel9" && (
                       <div className="space-y-3 mt-4 p-3 bg-muted/50 rounded-md border">
                         <div className="text-sm font-medium text-foreground">
                           Red Hat Customer Portal Credentials
                         </div>
                         <div className="grid grid-cols-1 gap-3">
                           <div>
                             <Label htmlFor="redhat-username" className="text-xs">Username</Label>
                             <Input
                               id="redhat-username"
                               placeholder="Red Hat username"
                               value={redhatCredentials?.username || ''}
                               onChange={(e) => onRedhatCredentialsChange?.({
                                 ...redhatCredentials,
                                 username: e.target.value,
                                 password: redhatCredentials?.password || ''
                               })}
                               className="text-sm"
                             />
                           </div>
                           <div>
                             <Label htmlFor="redhat-password" className="text-xs">Password</Label>
                             <Input
                               id="redhat-password"
                               type="password"
                               placeholder="Red Hat password"
                               value={redhatCredentials?.password || ''}
                               onChange={(e) => onRedhatCredentialsChange?.({
                                 ...redhatCredentials,
                                 username: redhatCredentials?.username || '',
                                 password: e.target.value
                               })}
                               className="text-sm"
                             />
                           </div>
                         </div>
                         <p className="text-xs text-muted-foreground">
                           Required to pull images from registry.redhat.io
                         </p>
                       </div>
                     )}
                   </div>
                 </div>
               ))}
               
               {/* Custom Image Option */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="custom" className="mt-1" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="custom-image" className="text-sm font-medium">
                    Custom Container Image
                  </Label>
                  <Input
                    id="custom-image"
                    placeholder="e.g., quay.io/org/ee:1.0"
                    value={customImage}
                    onChange={(e) => handleCustomImageChange(e.target.value)}
                    className={`${customImage.trim() && !isValidContainerImage(customImage) ? 'border-destructive' : ''}`}
                  />
                  {customImage.trim() && !isValidContainerImage(customImage) && (
                    <p className="text-xs text-destructive">
                      Invalid format. Use: [registry[:port]/][namespace/]name[:tag]
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Examples: registry.com/namespace/image:tag, namespace/image:tag, image:tag
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}