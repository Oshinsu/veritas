import type { ComponentType } from "react";
import {
  BarChart4,
  BellRing,
  Bot,
  Compass,
  FileBarChart,
  Gauge,
  Map,
  Palette,
  Share2,
  ShieldCheck,
  Sparkles,
  UserCog,
  UserRound
} from "lucide-react";

export type NavItem = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export const navItems: NavItem[] = [
  {
    title: "Overview",
    description: "Vue globale MQ/GP/GF & santé des flux",
    href: "/overview",
    icon: Gauge
  },
  {
    title: "Performance",
    description: "Pivot campagnes/adsets/ads & KPIs",
    href: "/performance",
    icon: BarChart4
  },
  {
    title: "Territories",
    description: "Command center MQ · GP · GF",
    href: "/territories",
    icon: Map
  },
  {
    title: "Opportunities",
    description: "Anomalies & runbooks priorisés",
    href: "/opportunities",
    icon: Compass
  },
  {
    title: "Planner",
    description: "Simulations MMM & what-if",
    href: "/planner",
    icon: Sparkles
  },
  {
    title: "Creatives",
    description: "Fatigue & intelligence créative",
    href: "/creatives",
    icon: Palette
  },
  {
    title: "Attribution",
    description: "Lift tests, clean rooms, CAPI",
    href: "/attribution",
    icon: Share2
  },
  {
    title: "Governance",
    description: "Data contracts & policies",
    href: "/governance",
    icon: ShieldCheck
  },
  {
    title: "Alerts",
    description: "Garde-fous & notifications",
    href: "/alerts",
    icon: BellRing
  },
  {
    title: "Reports",
    description: "Templates & exports white-label",
    href: "/reports",
    icon: FileBarChart
  },
  {
    title: "Copilot",
    description: "GPT-5 multimodal in-app",
    href: "/copilot",
    icon: Bot
  },
  {
    title: "Admin",
    description: "Paramétrage, quotas, observabilité",
    href: "/admin",
    icon: UserCog
  },
  {
    title: "Profile",
    description: "Préférences & clés API",
    href: "/profile",
    icon: UserRound
  }
];
