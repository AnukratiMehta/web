import { memberSchema } from "$lib/zod/schemas";
import { error, fail } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms/server";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
  const { prisma } = locals;
  const [memberResult, publishedArticlesResult] = await Promise.allSettled([
    prisma.member.findUnique({
      where: {
        studentId: params.studentId,
      },
      include: {
        mandates: {
          include: {
            position: {
              include: {
                committee: {
                  select: {
                    name: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
        authoredEvents: {
          orderBy: {
            startDatetime: "desc",
          },
          take: 5,
        },
      },
    }),
    prisma.article.findMany({
      where: {
        author: {
          member: {
            studentId: params.studentId,
          },
        },
        removedAt: null,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 5,
    }),
  ]);
  if (memberResult.status === "rejected") {
    throw error(500, "Could not fetch member");
  }
  if (publishedArticlesResult.status === "rejected") {
    throw error(500, "Could not fetch articles");
  }
  if (!memberResult.value) {
    throw error(404, "Member not found");
  }
  const member = memberResult.value;
  return {
    form: await superValidate(member, memberSchema),
    member,
    publishedArticles: publishedArticlesResult.value ?? [],
  };
};

const updateSchema = memberSchema.pick({
  firstName: true,
  lastName: true,
  nickname: true,
  foodPreference: true,
  classProgramme: true,
  classYear: true,
});

export type UpdateSchema = typeof updateSchema;

export const actions: Actions = {
  update: async ({ params, locals, request }) => {
    const { prisma } = locals;
    const form = await superValidate(request, updateSchema);
    if (!form.valid) return fail(400, { form });
    const { studentId } = params;
    await prisma.member.update({
      where: { studentId },
      data: {
        ...form.data,
      },
    });
    return message(form, {
      message: "Medlem uppdaterad",
      type: "success",
    });
  },
};
