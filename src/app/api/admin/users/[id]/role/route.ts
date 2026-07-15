import { NextRequest, NextResponse } from "next/server";
import { countAdmins, updateProfileRole } from "@/server/db/profileRepository";
import { requireAdmin } from "@/server/auth/session";
import { AppError, ValidationError, toStatusCode, toUserFacingMessage } from "@/lib/errors";
import type { UpdateUserRoleRequest, UpdateUserRoleResponse } from "@/types/api";
import type { UserRole } from "@/types/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_ROLES: UserRole[] = ["user", "admin"];

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = (await request.json()) as Partial<UpdateUserRoleRequest>;

    if (!body.role || !VALID_ROLES.includes(body.role)) {
      throw new ValidationError("Role must be either 'user' or 'admin'.");
    }

    if (body.role === "user") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        throw new AppError(
          "Cannot demote the last remaining admin. Promote another user first.",
          400
        );
      }
    }

    const user = await updateProfileRole(id, body.role);
    const response: UpdateUserRoleResponse = { user };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: toUserFacingMessage(error) },
      { status: toStatusCode(error) }
    );
  }
}
