import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  size?: "default" | "wide";
}

const MAX_WIDTHS: Record<NonNullable<ContainerProps["size"]>, string> = {
  default: "max-w-2xl",
  wide: "max-w-5xl",
};

export default function Container({ children, size = "default" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full ${MAX_WIDTHS[size]} px-4 py-12 sm:px-6`}>
      {children}
    </div>
  );
}
