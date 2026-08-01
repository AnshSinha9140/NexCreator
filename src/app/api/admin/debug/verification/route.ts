import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { connectToDatabase } from "@/lib/mongodb";
import { ResearchStorage } from "@/lib/creatorAudit/researchStorage";
import { AuditStorage } from "@/lib/creatorAudit/auditStorage";
import { VerificationIntegrityValidator, VerificationStateMapper } from "@/lib/creatorAudit/verificationStateMachine";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get("creatorId");

  if (!creatorId) {
    return NextResponse.json({ success: false, error: "Missing creatorId parameter" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();

    const matchCriteria: any[] = [{ email: creatorId.toLowerCase() }, { id: creatorId }];
    if (ObjectId.isValid(creatorId)) {
      matchCriteria.push({ _id: new ObjectId(creatorId) });
    }

    const user = await db.collection("users").findOne({ $or: matchCriteria });

    const auditProfile = AuditStorage.getProfile(creatorId);
    const evidenceJson = ResearchStorage.getEvidence(creatorId);
    const researchDoc = ResearchStorage.getResearch(creatorId);

    const canonicalStatus = VerificationStateMapper.toCanonical(user?.status);
    const integrityResult = VerificationIntegrityValidator.validate(user, auditProfile, evidenceJson);

    return NextResponse.json({
      success: true,
      creatorId,
      canonicalStatus,
      mongoUser: user
        ? {
            id: user._id?.toString(),
            email: user.email,
            status: user.status,
            onboardingCompleted: Boolean(user.onboardingCompleted),
            updatedAt: user.updatedAt,
          }
        : null,
      auditProfile: auditProfile ? { exists: true, createdAt: auditProfile.createdAt } : { exists: false },
      evidenceJson: evidenceJson ? { exists: true, version: evidenceJson.version } : { exists: false },
      researchDoc: researchDoc ? { exists: true, importedAt: researchDoc.importedAt } : { exists: false },
      detectedInconsistencies: integrityResult.errors,
      isIntegrityValid: integrityResult.valid,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
