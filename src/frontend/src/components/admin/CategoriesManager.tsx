import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Category } from "../../backend.d";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../hooks/useQueries";

export function CategoriesManager() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const sortedCategories = [...categories].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory.mutateAsync({
        id: crypto.randomUUID(),
        name: newName.trim(),
        order: BigInt(categories.length),
      });
      setNewName("");
      toast.success("Category created");
    } catch {
      toast.error("Failed to create category");
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleUpdate = async (cat: Category) => {
    if (!editingName.trim()) return;
    try {
      await updateCategory.mutateAsync({
        id: cat.id,
        name: editingName.trim(),
        order: cat.order,
      });
      setEditingId(null);
      toast.success("Category updated");
    } catch {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const handleReorder = async (cat: Category, direction: "up" | "down") => {
    const idx = sortedCategories.findIndex((c) => c.id === cat.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sortedCategories.length) return;

    const other = sortedCategories[swapIdx];
    try {
      await Promise.all([
        updateCategory.mutateAsync({
          id: cat.id,
          name: cat.name,
          order: other.order,
        }),
        updateCategory.mutateAsync({
          id: other.id,
          name: other.name,
          order: cat.order,
        }),
      ]);
      toast.success("Reordered");
    } catch {
      toast.error("Failed to reorder");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-ocid="categories.loading_state">
        {["sk1", "sk2", "sk3", "sk4"].map((id) => (
          <Skeleton key={id} className="h-14 rounded-lg bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <p className="text-muted-foreground text-sm">
        Create categories to organize your video portfolio. They appear as
        filter tabs on the work section.
      </p>

      {/* Add new category */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h3 className="font-semibold text-sm text-foreground mb-4">
          Add New Category
        </h3>
        <div className="flex gap-3">
          <Input
            placeholder="Category name (e.g. Cinematic Edits)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="bg-white/5 border-white/10 text-foreground"
            data-ocid="categories.new.input"
          />
          <Button
            onClick={handleCreate}
            disabled={!newName.trim() || createCategory.isPending}
            className="bg-cyan/10 text-cyan border border-cyan/20 hover:bg-cyan/20 shrink-0"
            variant="outline"
            data-ocid="categories.add.button"
          >
            {createCategory.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Plus size={14} className="mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Category list */}
      {sortedCategories.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-xl"
          data-ocid="categories.empty_state"
        >
          <p className="text-sm">
            No categories yet. Add your first one above.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedCategories.map((cat, i) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors group"
              data-ocid={`categories.item.${i + 1}`}
            >
              {/* Order badge */}
              <span className="text-xs text-muted-foreground font-mono w-5 text-center">
                {i + 1}
              </span>

              {/* Name / edit */}
              {editingId === cat.id ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdate(cat);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="bg-white/10 border-cyan/30 text-foreground h-8 flex-1"
                  autoFocus
                  data-ocid={`categories.edit.input.${i + 1}`}
                />
              ) : (
                <span className="flex-1 text-sm font-medium text-foreground">
                  {cat.name}
                </span>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId === cat.id ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleUpdate(cat)}
                      className="h-7 w-7 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                      data-ocid={`categories.save_button.${i + 1}`}
                    >
                      <Check size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      data-ocid={`categories.cancel_button.${i + 1}`}
                    >
                      <X size={14} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleReorder(cat, "up")}
                      disabled={i === 0}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      data-ocid={`categories.up.button.${i + 1}`}
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleReorder(cat, "down")}
                      disabled={i === sortedCategories.length - 1}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      data-ocid={`categories.down.button.${i + 1}`}
                    >
                      <ArrowDown size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(cat)}
                      className="h-7 w-7 text-muted-foreground hover:text-cyan"
                      data-ocid={`categories.edit_button.${i + 1}`}
                    >
                      <Pencil size={14} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          data-ocid={`categories.delete_button.${i + 1}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent
                        className="glass-dark border-white/10"
                        data-ocid="categories.dialog"
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete "{cat.name}"? Videos
                            in this category will remain but become
                            uncategorized.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            className="bg-white/5 border-white/10"
                            data-ocid="categories.cancel_button"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cat.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-ocid="categories.confirm_button"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
