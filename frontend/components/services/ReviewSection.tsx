"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESSES, REVIEW_SYSTEM_ABI } from "@/lib/contracts";

interface Review {
  reviewer: string;
  serviceId: bigint;
  score: number;
  comment: string;
  timestamp: bigint;
}

export function ReviewSection({ serviceId }: { serviceId: string }) {
  const { address, isConnected } = useAccount();
  const reviewSystemAddress = CONTRACT_ADDRESSES.reviewSystem as `0x${string}`;

  const { data: reviews, refetch: refetchReviews } = useReadContract({
    address: reviewSystemAddress,
    abi: REVIEW_SYSTEM_ABI,
    functionName: "getReviews",
    args: [BigInt(serviceId)],
    query: { enabled: !!reviewSystemAddress },
  });

  const { data: avgScore } = useReadContract({
    address: reviewSystemAddress,
    abi: REVIEW_SYSTEM_ABI,
    functionName: "getAverageScore",
    args: [BigInt(serviceId)],
    query: { enabled: !!reviewSystemAddress },
  });

  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  const { writeContract, data: txHash, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  useEffect(() => {
    if (isSuccess) {
      refetchReviews();
      reset();
      setComment("");
    }
  }, [isSuccess]);

  function handleSubmitReview() {
    if (!reviewSystemAddress) return;
    writeContract({
      address: reviewSystemAddress,
      abi: REVIEW_SYSTEM_ABI,
      functionName: "rate",
      args: [BigInt(serviceId), score, comment],
    });
  }

  const reviewList = (reviews as Review[]) || [];
  const avgDisplay = avgScore ? Number(avgScore) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Reviews</h3>
        {avgDisplay > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= avgDisplay ? "text-[#F7931A]" : "text-zinc-700"}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-zinc-400">
              {avgDisplay}/5 ({reviewList.length} review{reviewList.length !== 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      {/* Review List */}
      {reviewList.length === 0 ? (
        <p className="text-sm text-zinc-500">No reviews yet. Be the first to leave one!</p>
      ) : (
        <div className="space-y-3">
          {reviewList.map((r, i) => (
            <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={s <= r.score ? "text-[#F7931A]" : "text-zinc-700"}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500">
                    {r.reviewer.slice(0, 6)}...{r.reviewer.slice(-4)}
                  </span>
                </div>
                <span className="text-xs text-zinc-600">
                  {new Date(Number(r.timestamp) * 1000).toLocaleDateString()}
                </span>
              </div>
              {r.comment && <p className="text-sm text-zinc-300">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Leave Review Form */}
      {isConnected && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 space-y-4">
          <h4 className="text-sm font-medium text-zinc-300">Leave a Review</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Score:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setScore(s)}
                  className={`text-lg transition-colors ${s <= score ? "text-[#F7931A]" : "text-zinc-700 hover:text-zinc-500"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review (optional)..."
            className="w-full h-20 rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F7931A] resize-none"
          />
          <button
            onClick={handleSubmitReview}
            disabled={confirming || !reviewSystemAddress}
            className="px-4 py-2 rounded-lg bg-[#F7931A] text-black text-sm font-medium hover:bg-[#F7931A]/90 transition-colors disabled:opacity-50"
          >
            {confirming ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {!isConnected && (
        <p className="text-sm text-zinc-500">Connect your wallet to leave a review.</p>
      )}
    </div>
  );
}
