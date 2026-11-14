import PostForm from "@/components/admin/PostForm";

export default function NewPostPage() {
  return (
    <div dir="rtl" className="space-y-6">
      <h1 className="text-2xl font-semibold">پست جدید</h1>
      <PostForm />
    </div>
  );
}
