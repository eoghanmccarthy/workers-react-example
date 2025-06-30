import { createFileRoute } from "@tanstack/react-router";
import { MediaUpload } from "../components/MediaUpload";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  // Only render in development
  // if (import.meta.env.MODE !== 'development') {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h1>
  //         <p className="text-zinc-600">Admin interface is only available in development mode.</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Media Admin</h1>
          <p className="text-zinc-600">
            Upload new media content to your feed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <MediaUpload />
          </div>

          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h2 className="text-lg font-medium mb-4">Upload Guidelines</h2>
            <div className="space-y-3 text-sm text-zinc-600">
              <div>
                <strong>Supported formats:</strong>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Images: JPEG, PNG, WebP, GIF</li>
                  <li>Videos: MP4, WebM, MOV</li>
                  <li>Audio: MP3, WAV, OGG</li>
                </ul>
              </div>

              <div>
                <strong>File size limits:</strong>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Images: Up to 10MB</li>
                  <li>Videos: Up to 100MB</li>
                  <li>Audio: Up to 50MB</li>
                </ul>
              </div>

              <div>
                <strong>Tips:</strong>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Add descriptive titles for better organization</li>
                  <li>Use tags to categorize content</li>
                  <li>Compress large files for better performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to Feed
          </a>
        </div>
      </div>
    </div>
  );
}
