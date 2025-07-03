import React from 'react';
import { Link } from 'react-router-dom';
import { GenericCardProps } from '../types/GenericCardProps';

interface ExtendedGenericCardProps extends GenericCardProps {
  loading?: boolean;
  address?: string;
  className?: string;
}

export default function GenericCard({
  title,
  description,
  imageUrl,
  footerContent,
  to,
  toData,
  children,
  address,
  loading = false,
  className,
}: ExtendedGenericCardProps) {
  return (
    <div
      className={`bg-orange-50 border border-amber-600 rounded-2xl shadow-sm p-4 w-64 transition-transform duration-200 hover:scale-105 hover:shadow-md ${
        loading ? 'animate-pulse' : ''
      }`}
    >
      {/* Image or Skeleton */}
      <div className="relative h-40 w-full mb-3">
        {loading ? (
          <div className="h-full w-full bg-amber-200 rounded-xl" />
        ) : to ? (
          <Link to={to} state={toData}>
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover rounded-xl border border-amber-600"
            />
          </Link>
        ) : (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover rounded-xl border border-amber-600"
          />
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-red-700">
        {loading ? <div className="h-5 bg-amber-200 rounded w-3/4" /> : title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-amber-800 mt-1">
          {loading ? <div className="h-4 bg-amber-200 rounded w-5/6 mt-1" /> : description}
        </p>
      )}

      {/* Address */}
      {address && (
        <p className="text-sm text-amber-800 mt-1 italic">
          {loading ? <div className="h-4 bg-amber-200 rounded w-2/3 mt-1" /> : address}
        </p>
      )}

      {/* Footer */}
      {footerContent && (
        <div className="text-right text-orange-700 font-semibold mt-2">
          {loading ? <div className="h-4 bg-amber-200 rounded w-1/2 ml-auto" /> : footerContent}
        </div>
      )}

      {/* Action Slot */}
      <div className="mt-4">{!loading && children}</div>
    </div>
  );
}