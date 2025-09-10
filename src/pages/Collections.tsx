import { CollectionSelector } from "@/components/CollectionSelector";

const Collections = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Collections</h1>
        <p className="text-muted-foreground">
          Configure Ansible collections for your execution environment
        </p>
      </div>
      <CollectionSelector />
    </div>
  );
};

export default Collections;