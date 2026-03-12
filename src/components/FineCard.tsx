import { Fine } from "@/types";
import { format } from "date-fns";
import { Calendar, Users, ArrowRightLeft } from "lucide-react";
import { clsx } from "clsx";

interface FineCardProps {
  fine: Fine;
  showActions?: boolean;
  onDelete?: (id: number) => void;
}

export default function FineCard({ fine, showActions, onDelete }: FineCardProps) {
  const memberNames = fine.fineMembers.map((fm) => fm.member.name).join(", ");

  return (
    <div className={clsx("card p-5 animate-slide-up")}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Members */}
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} style={{ color: "var(--accent-primary)" }} />
            <span
              className="font-semibold text-sm"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              {memberNames}
            </span>
          </div>

          {/* Reason */}
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            {fine.reason}
          </p>

          {/* Reversed to */}
          {fine.reversedToMember && (
            <div
              className="flex items-center gap-1.5 text-xs mb-2"
              style={{ color: "#60a5fa" }}
            >
              <ArrowRightLeft size={12} />
              Reversed to {fine.reversedToMember.name}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4">
            {fine.fineDate && (
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <Calendar size={12} />
                {format(new Date(fine.fineDate), "MMM d, yyyy")}
              </div>
            )}
            <div
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Submitted {format(new Date(fine.createdAt), "MMM d")}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={clsx(
              "badge",
              fine.status === "pending" && "badge-pending",
              fine.status === "accepted" && "badge-accepted",
              fine.status === "reversed" && "badge-reversed",
              fine.status === "skipped" && "badge-skipped"
            )}
          >
            {fine.status}
          </span>

          {showActions && onDelete && (
            <button
              onClick={() => onDelete(fine.id)}
              className="text-xs px-3 py-1 rounded-lg transition-colors"
              style={{ color: "var(--accent-hot)" }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
