import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const AddPriceSearchButton = () => {
  return (
    <Button asChild>
      <Link href="/gerenciar-pesquisas/new">
        <Plus className="h-4 w-4" />
        Nova pesquisa
      </Link>
    </Button>
  );
};

export default AddPriceSearchButton;
