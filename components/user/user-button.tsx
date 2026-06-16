"use client";

import {
  useAuth,
  useSession,
  useSetActiveSession,
  useSignOut,
} from "@better-auth-ui/react";
import { useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserPlus2,
  UsersRound,
  MailCheck,
  AlertCircle,
  LayoutDashboard,
  User,
  ShoppingCart,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SwitchAccountMenu } from "./switch-account-menu";
import { UserAvatar } from "./user-avatar";
import { UserView } from "./user-view";

export type UserButtonProps = {
  className?: string;
  align?: "center" | "end" | "start" | undefined;
  sideOffset?: number;
  size?: "default" | "icon";
  themeToggle?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "ghost"
    | "link"
    | "outline"
    | "secondary";
  showVerificationBadge?: boolean;
  customItems?: React.ReactNode;
  isSeller?: boolean;
  isAdmin?: boolean;
  hasPendingApplication?: boolean;
};

export function UserButton({
  className,
  align,
  sideOffset,
  size = "default",
  themeToggle = true,
  variant = "ghost",
  showVerificationBadge = true,
  customItems,
  isSeller,
  isAdmin,
  hasPendingApplication,
}: UserButtonProps) {
  const {
    basePaths,
    viewPaths,
    localization,
    multiSession,
    Link,
    appearance: { theme, setTheme, themes },
  } = useAuth();

  const router = useRouter();
  const { isPending: settingActiveSession } = useSetActiveSession();
  const { data: session, isPending: sessionPending } = useSession();

  const { mutate: signOut } = useSignOut({
    onSuccess: () => {
      router.refresh();
      router.push(`${basePaths.auth}/${viewPaths.auth.signIn}`);
    },
  });

  const isEmailVerified = session?.user?.emailVerified;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          size === "icon" && "rounded-full",
          size === "icon" && className,
        )}
        asChild={size === "default"}
      >
        {size === "icon" ? (
          <div className="relative cursor-pointer">
            <UserAvatar />
            {showVerificationBadge && !isEmailVerified && session && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
              </span>
            )}
          </div>
        ) : (
          <Button
            variant={variant}
            className={cn("py-2.5 h-auto font-normal", className)}
            size="lg"
          >
            {session || sessionPending || settingActiveSession ? (
              <UserView isPending={!!settingActiveSession} />
            ) : (
              <>
                <UserAvatar />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {localization.auth.account}
                </div>
              </>
            )}
            <ChevronsUpDown className="ml-auto" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-52 max-w-[90vw]"
        sideOffset={sideOffset ?? 8}
        align={align ?? "end"}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {session && (
          <>
            <DropdownMenuLabel className="text-sm font-normal p-3">
              <UserView />
              {!isEmailVerified && showVerificationBadge && (
                <Badge
                  variant="outline"
                  className="mt-2 text-destructive border-destructive/40 text-xs font-normal"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Email not verified
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {session ? (
          <>
            {/* Account */}
            <DropdownMenuItem asChild>
              <Link href="/account">
                <User className="h-4 w-4 text-muted-foreground" />
                Account
              </Link>
            </DropdownMenuItem>

            {/* My Orders */}
            <DropdownMenuItem asChild>
              <Link href="/my-orders">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                My Orders
              </Link>
            </DropdownMenuItem>

            {/* Role-based items */}
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium">
                    Admin Dashboard
                  </span>
                </Link>
              </DropdownMenuItem>
            )}

            {isSeller && !isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/seller">
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  Seller Dashboard
                </Link>
              </DropdownMenuItem>
            )}

            {!isSeller && !isAdmin && !hasPendingApplication && (
              <DropdownMenuItem asChild>
                <Link href="/become-seller">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  Become a Seller
                </Link>
              </DropdownMenuItem>
            )}

            {!isSeller && !isAdmin && hasPendingApplication && (
              <div className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground/60 cursor-default select-none">
                <Store className="h-4 w-4 shrink-0" />
                Application Pending
              </div>
            )}

            <DropdownMenuSeparator />

            {/* Email verification */}
            {!isEmailVerified && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`${basePaths.auth}/verify-email`}>
                    <MailCheck className="h-4 w-4 text-destructive" />
                    <span className="flex-1">Verify Email</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      Required
                    </Badge>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Settings */}
            <DropdownMenuItem asChild>
              <Link
                href={`${basePaths.settings}/${viewPaths.settings.account}`}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                {localization.settings.settings}
              </Link>
            </DropdownMenuItem>

            {multiSession && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UsersRound className="h-4 w-4 text-muted-foreground" />
                  {localization.auth.switchAccount}
                </DropdownMenuSubTrigger>
                <SwitchAccountMenu />
              </DropdownMenuSub>
            )}

            <DropdownMenuSeparator />

            {/* Theme toggle */}
            {themeToggle && theme && setTheme && !!themes?.length && (
              <>
                <DropdownMenuItem
                  className="justify-between hover:bg-transparent! cursor-default! py-1.5"
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="text-sm text-muted-foreground">
                    {localization.settings.theme}
                  </span>
                  <Tabs value={theme} onValueChange={setTheme}>
                    <TabsList className="h-6!">
                      {themes.includes("system") && (
                        <TabsTrigger
                          value="system"
                          className="size-5 p-0"
                          aria-label={localization.settings.system}
                        >
                          <Monitor className="size-3" />
                        </TabsTrigger>
                      )}
                      {themes.includes("light") && (
                        <TabsTrigger
                          value="light"
                          className="size-5 p-0"
                          aria-label={localization.settings.light}
                        >
                          <Sun className="size-3" />
                        </TabsTrigger>
                      )}
                      {themes.includes("dark") && (
                        <TabsTrigger
                          value="dark"
                          className="size-5 p-0"
                          aria-label={localization.settings.dark}
                        >
                          <Moon className="size-3" />
                        </TabsTrigger>
                      )}
                    </TabsList>
                  </Tabs>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Custom items slot */}
            {customItems && (
              <>
                {customItems}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Sign out */}
            <DropdownMenuItem
              onSelect={() => signOut()}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              {localization.auth.signOut}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href={`${basePaths.auth}/${viewPaths.auth.signIn}`}>
                <LogIn className="h-4 w-4 text-muted-foreground" />
                {localization.auth.signIn}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`${basePaths.auth}/${viewPaths.auth.signUp}`}>
                <UserPlus2 className="h-4 w-4 text-muted-foreground" />
                {localization.auth.signUp}
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
