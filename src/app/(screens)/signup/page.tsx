import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Sign up to start building your knowledge base."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
