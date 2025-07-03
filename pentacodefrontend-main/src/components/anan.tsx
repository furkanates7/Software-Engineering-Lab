import React from 'react';
import { Link } from 'react-router-dom';

import { Menu } from '../types/Menu';
import { Restaurant } from '../types/Restaurant';

interface UniversalCardProps {
  data?: Menu | Restaurant | null;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  category?: string;
  isAvailable?: boolean;
  isDrink?: boolean;
  address?: string;
  phoneNumber?: string;
  version?: string;
  footerContent?: React.ReactNode;
  to?: string;
  toData?: any;
  loading?: boolean;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  onEdit?: () => void;
  onDelete?: (id: number) => void;
  id?: number;
  children?: React.ReactNode;
}

export default function Anana({
  data,
  title: explicitTitle,
  description: explicitDescription,
  imageUrl: explicitImageUrl,
  price: explicitPrice,
  category: explicitCategory,
  isAvailable: explicitIsAvailable,
  isDrink: explicitIsDrink,
  address: explicitAddress,
  phoneNumber: explicitPhoneNumber,
  version: explicitVersion,
  footerContent,
  to: explicitTo,
  toData,
  loading = false,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  id: explicitId,
  children,
}: UniversalCardProps) {
  const isMenu = data && 'price' in data;
  const isRestaurant = data && 'version' in data;

  const id = explicitId ?? (data ? data.pk : undefined);
  const title = explicitTitle ?? (data ? data.name : 'Untitled');
  const description = explicitDescription ?? (data ? data.description : undefined);
  const imageUrl =
    explicitImageUrl ?? (data && data.imageUrl ? data.imageUrl : 'https://via.placeholder.com/150?text=No+Image');
  const price = explicitPrice ?? (isMenu ? (data as Menu).price : undefined);
  const category = explicitCategory ?? (isMenu ? (data as Menu).category : undefined);
  const isAvailable = explicitIsAvailable ?? (isMenu ? (data as Menu).isAvailable : undefined);
  const isDrink = explicitIsDrink ?? (isMenu ? (data as Menu).isDrink : undefined);
  const address = explicitAddress ?? (isRestaurant ? (data as Restaurant).address : undefined);
  const phoneNumber = explicitPhoneNumber ?? (isRestaurant ? (data as Restaurant).phoneNumber : undefined);
  const version = explicitVersion ?? (isRestaurant ? (data as Restaurant).version : undefined);
  const to =
    explicitTo ?? (isRestaurant ? `/customer/restaurants/${(data as Restaurant).pk}` : undefined);

  const CardBody = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Title and checkbox/edit/delete */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {onSelect && id !== undefined && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(id)}
                className="h-5 w-5 text-orange-700"
              />
            )}
            <h3 className="text-lg font-bold text-orange-700">
              {loading ? <div className="h-5 bg-orange-100 rounded w-3/4" /> : title}
            </h3>
          </div>
          {(onEdit || onDelete) && id !== undefined && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-3 py-1 bg-orange-700 text-white text-sm rounded hover:bg-orange-800"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative h-48 w-full mt-3">
          {loading ? (
            <div className="h-full w-full bg-orange-100 rounded-xl" />
          ) : (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover rounded-xl border border-orange-200"
              style={{ aspectRatio: '1 / 1' }}
            />
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-orange-600 mt-3">
            {loading ? (
              <div className="h-4 bg-orange-100 rounded w-5/6 mt-1" />
            ) : description.length > 50 ? (
              `${description.slice(0, 50)}...`
            ) : (
              description
            )}
          </p>
        )}

        {/* Price / Details */}
        {price !== undefined && (
          <p className="text-orange-600 font-semibold text-base mt-1">
            {loading ? <div className="h-4 bg-orange-100 rounded w-1/4 mt-1" /> : `$${price.toFixed(2)}`}
          </p>
        )}
        {category && (
          <p className="text-amber-700 text-base mt-1">
            {loading ? <div className="h-4 bg-orange-100 rounded w-2/3 mt-1" /> : `Category: ${category}`}
          </p>
        )}
        {address && (
          <p className="text-amber-700 text-base mt-1 italic">
            {loading ? <div className="h-4 bg-orange-100 rounded w-2/3 mt-1" /> : `Address: ${address}`}
          </p>
        )}
        {phoneNumber && (
          <p className="text-amber-700 text-base mt-1">
            {loading ? <div className="h-4 bg-orange-100 rounded w-2/3 mt-1" /> : `Phone: ${phoneNumber}`}
          </p>
        )}
        {version && (
          <p className="text-amber-700 text-base mt-1">
            {loading ? <div className="h-4 bg-orange-100 rounded w-1/4 mt-1" /> : `Version: ${version}`}
          </p>
        )}

        {/* Tags */}
        {(isAvailable !== undefined || isDrink !== undefined) && (
          <div className="mt-2 flex space-x-2">
            {isAvailable !== undefined && (
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${
                  isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}
              >
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            )}
            {isDrink !== undefined && (
              <span className="inline-block px-2 py-1 rounded text-sm bg-amber-200 text-amber-800">
                {isDrink ? 'Drink' : 'Food'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer & Children */}
      <div className="mt-4 space-y-2">
        {footerContent && (
          <div className="text-right text-orange-500 font-semibold">
            {loading ? <div className="h-4 bg-orange-100 rounded w-1/2 ml-auto" /> : footerContent}
          </div>
        )}
        {!loading && children}
      </div>
    </div>
  );

  const CardWrapper = (
    <div
      className={`bg-orange-50 border border-orange-200 rounded-2xl shadow-sm p-4 w-full max-w-[300px] transition-transform duration-200 hover:scale-105 hover:shadow-md ${
        loading ? 'animate-pulse' : ''
      }`}
    >
      {CardBody}
    </div>
  );

  return to ? (
    <div className="w-full max-w-[300px]">
      <Link to={to} state={toData} className="block">
        {CardWrapper}
      </Link>
    </div>
  ) : (
    CardWrapper
  );
}
