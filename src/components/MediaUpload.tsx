import { useForm } from "@tanstack/react-form";
// import type { MediaType } from "../types/media";

interface Post {
  password?: string;
  file: File | null;
  title: string;
  description: string;
  tags: string;
}

const defaultPost: Post = {
  password: "",
  file: null as File | null,
  title: "",
  description: "",
  tags: "",
};

export function MediaUpload() {
  const handleUpload = async (data: Post) => {
    const { password, file } = data;
    if (!file) return;

    // 1. Upload file directly
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);
    formData.append("contentType", file.type);

    const uploadResponse = await fetch("/api/upload", {
      method: "PUT",
      headers: {
        "X-Custom-Auth-Key": password || "", // Include password if provided
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to get upload URL");
    }

    const { fileKey, publicUrl, message } = await uploadResponse.json();
    console.log("Upload URL response:", fileKey, publicUrl, message);

    // 2. Create post metadata
    // const mediaUrl = publicUrl || `https://your-r2-domain.com/${fileKey}`;

    // const postResponse = await fetch("/api/posts", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     type: getMediaType(file),
    //     title: title || undefined,
    //     description: description || undefined,
    //     tags: tags
    //       .split(",")
    //       .map((tag: string) => tag.trim())
    //       .filter(Boolean),
    //     media_url: mediaUrl,
    //     file_size: file.size,
    //     mime_type: file.type,
    //   }),
    // });
    //
    // if (!postResponse.ok) {
    //   throw new Error("Failed to create post");
    // }
  };

  // const getMediaType = (file: File): MediaType => {
  //   if (file.type.startsWith("image/")) return "image";
  //   if (file.type.startsWith("video/")) return "video";
  //   if (file.type.startsWith("audio/")) return "audio";
  //   return "image"; // fallback
  // };

  const form = useForm({
    defaultValues: defaultPost,
    onSubmit: async ({ value, formApi }) => {
      if (!value.file) return;
      try {
        await handleUpload(value);
        formApi.reset();
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      }
    },
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg border border-zinc-200">
      <h2 className="text-lg font-medium mb-4">Upload Media</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="password"
          children={(field) => {
            return (
              <div>
                <label htmlFor={field.name}>Password (optional):</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a password..."
                />
              </div>
            );
          }}
        />

        <form.Field
          name="file"
          children={(field) => (
            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-zinc-700 mb-1"
              >
                Media File
              </label>
              <input
                type="file"
                id="file"
                accept="image/*,video/*,audio/*"
                onChange={(e) =>
                  field.handleChange(e.target.files?.[0] || null)
                }
                required
                className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
              />
              {field.state.value && (
                <div className="text-sm text-zinc-600 mt-1">
                  Selected: {field.state.value.name} (
                  {(field.state.value.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          )}
        />

        <form.Field
          name="title"
          children={(field) => {
            return (
              <div>
                <label htmlFor={field.name}>Title (optional):</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a title..."
                />
              </div>
            );
          }}
        />

        <form.Field
          name="description"
          children={(field) => (
            <div>
              <label htmlFor={field.name}>Description (optional):</label>
              <textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a description..."
              />
            </div>
          )}
        />

        <form.Field
          name="tags"
          children={(field) => (
            <div>
              <label htmlFor={field.name}>Tags (optional):</label>
              <input
                type="text"
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tags separated by commas..."
              />
            </div>
          )}
        />

        <form.Subscribe
          selector={(state) => [
            state.values.file,
            state.canSubmit,
            state.isSubmitting,
          ]}
          children={([selectedFile, canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!selectedFile || !!isSubmitting || !canSubmit}
              className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!!isSubmitting ? "Uploading..." : "Upload Media"}
            </button>
          )}
        />
      </form>
    </div>
  );
}
