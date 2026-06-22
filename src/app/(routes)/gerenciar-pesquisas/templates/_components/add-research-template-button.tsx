import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const AddResearchTemplateButton = () => {
  return (
    <Button asChild>
      <Link href="/gerenciar-pesquisas/templates/new">
        <Plus className="h-4 w-4" />
        Novo template
      </Link>
    </Button>
  );
};

export default AddResearchTemplateButton;
