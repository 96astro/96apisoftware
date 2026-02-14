"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type DeleteReportButtonProps = {
  endpoint: string;
  confirmText: string;
};

const DeleteReportButton = ({ endpoint, confirmText }: DeleteReportButtonProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(confirmText);
    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(result.error || "Failed to delete report.");
        return;
      }

      toast.success("Report deleted.");
      router.refresh();
    } catch {
      toast.error("Failed to delete report.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="destructive"
      type="button"
      disabled={isDeleting}
      onClick={handleDelete}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
};

export default DeleteReportButton;
