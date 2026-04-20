import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=60, s-maxage=300",
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);
  const { searchParams } = new URL(request.url);
  const siteKey = searchParams.get("site_key");

  if (!siteKey) {
    return NextResponse.json(
      { error: "site_key is required" },
      { status: 400, headers }
    );
  }

  const project = await prisma.project.findUnique({
    where: { siteKey },
    select: {
      themePrimary: true,
      themeBackground: true,
      themeForeground: true,
      themeFontFamily: true,
      themeBorderRadius: true,
      widgetPosition: true,
      widgetLabel: true,
      widgetSize: true,
      widgetIcon: true,
      widgetHeaderTitle: true,
      widgetHeaderSubtitle: true,
      widgetContentPlaceholder: true,
      widgetEmailPlaceholder: true,
      widgetAttachText: true,
      widgetSubmitText: true,
      widgetSuccessMessage: true,
      widgetShowEmail: true,
      widgetRequireEmail: true,
      widgetShowScreenshot: true,
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Invalid site key" },
      { status: 401, headers }
    );
  }

  return NextResponse.json(
    {
      theme: {
        primary: project.themePrimary,
        background: project.themeBackground,
        foreground: project.themeForeground,
        fontFamily: project.themeFontFamily,
        borderRadius: project.themeBorderRadius,
      },
      widget: {
        position: project.widgetPosition,
        label: project.widgetLabel,
        size: project.widgetSize,
        icon: project.widgetIcon,
        copy: {
          headerTitle: project.widgetHeaderTitle,
          headerSubtitle: project.widgetHeaderSubtitle,
          contentPlaceholder: project.widgetContentPlaceholder,
          emailPlaceholder: project.widgetEmailPlaceholder,
          attachText: project.widgetAttachText,
          submitText: project.widgetSubmitText,
          successMessage: project.widgetSuccessMessage,
        },
        fields: {
          showEmail: project.widgetShowEmail,
          requireEmail: project.widgetRequireEmail,
          showScreenshot: project.widgetShowScreenshot,
        },
      },
    },
    { headers }
  );
}
