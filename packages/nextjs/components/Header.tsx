"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SwitchTheme } from "./SwitchTheme";
import { hardhat } from "viem/chains";
import {
  Bars3Icon, // BugAntIcon,
  ScaleIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TrophyIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useCartStore } from "~~/stores/cartStore";
import { useComparisonStore } from "~~/stores/comparisonStore";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/marketplace", icon: <ShoppingBagIcon className="h-4 w-4" /> },
  { label: "Creators", href: "/creators", icon: <UserGroupIcon className="h-4 w-4" /> },
  { label: "Brands", href: "/brands", icon: <TrophyIcon className="h-4 w-4" /> },
  { label: "Profile", href: "/profile", icon: <UserIcon className="h-4 w-4" /> },
  { label: "ENS Demo", href: "/ens-demo", icon: <ScaleIcon className="h-4 w-4" /> },
  // { label: "Debug Contracts", href: "/debug", icon: <BugAntIcon className="h-4 w-4" /> },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { getTotalItems, openCart } = useCartStore();
  const { getComparisonCount, openComparison } = useComparisonStore();

  const cartItemCount = getTotalItems();
  const comparisonCount = getComparisonCount();

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-50 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer w-45 h-45" fill src="/logo2.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">SankofaChain</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4 flex items-center gap-3">
        {comparisonCount > 0 && (
          <button
            onClick={openComparison}
            className="btn btn-ghost btn-circle relative"
            aria-label={`View product comparison (${comparisonCount} items)`}
          >
            <ScaleIcon className="w-5 h-5" />
            {comparisonCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-content text-xs rounded-full min-w-[1.2rem] h-5 flex items-center justify-center">
                {comparisonCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={openCart}
          className="btn btn-ghost btn-circle relative"
          aria-label={`View cart (${cartItemCount} items)`}
        >
          <ShoppingCartIcon className="w-5 h-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-content text-xs rounded-full min-w-[1.2rem] h-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>

        <SwitchTheme />
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
