import UserProfile from "@/components/user-profile";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <UserProfile />
        </div>
      </main>
    </div>
  );
}
