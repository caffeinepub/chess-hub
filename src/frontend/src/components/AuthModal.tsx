import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const { login, isLoggingIn, loginStatus, identity } = useInternetIdentity();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isRegistering, setIsRegistering] = React.useState(false);

  React.useEffect(() => {
    if (loginStatus === "success" && identity) {
      onSuccess();
    }
  }, [loginStatus, identity, onSuccess]);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setIsRegistering(true);
    try {
      const { createActorWithConfig } = await import("../config");
      const actor = await createActorWithConfig();
      await actor.registerPlayer(fullName.trim(), email.trim());
      toast.success("Registration successful!");
      onSuccess();
    } catch {
      toast.success("Welcome back!");
      onSuccess();
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = () => {
    login();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
            role="button"
            tabIndex={-1}
            aria-label="Close modal"
          />
          <motion.div
            className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 z-10"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            data-ocid="auth.modal"
          >
            <button
              type="button"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={onClose}
              data-ocid="auth.close_button"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-6 pt-6 pb-4 border-b border-border">
              <div className="text-2xl mb-1">♔</div>
              <h2 className="text-xl font-bold text-foreground">Chess Hub</h2>
              <p className="text-sm text-muted-foreground">
                Sign in to track your games
              </p>
            </div>

            <div className="p-6">
              <Tabs defaultValue="login">
                <TabsList className="w-full mb-6">
                  <TabsTrigger
                    value="login"
                    className="flex-1"
                    data-ocid="auth.login_tab"
                  >
                    Log In
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="flex-1"
                    data-ocid="auth.register_tab"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Use Internet Identity to securely log in.
                  </p>
                  <Button
                    className="w-full bg-navy-dark hover:bg-navy-mid text-white"
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    data-ocid="auth.login_button"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {isLoggingIn ? "Connecting..." : "Log In with Identity"}
                  </Button>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="text-xs font-semibold uppercase tracking-wide"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Magnus Carlsen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      data-ocid="auth.name_input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-semibold uppercase tracking-wide"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="magnus@chess.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-ocid="auth.email_input"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You'll connect your Internet Identity after registering.
                  </p>
                  <Button
                    className="w-full bg-navy-dark hover:bg-navy-mid text-white"
                    onClick={async () => {
                      await handleRegister();
                      handleLogin();
                    }}
                    disabled={isRegistering}
                    data-ocid="auth.register_button"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isRegistering ? "Registering..." : "Register & Connect"}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="mt-4 pt-4 border-t border-border text-center">
                <Button
                  variant="ghost"
                  className="text-sm text-muted-foreground"
                  onClick={onClose}
                  data-ocid="auth.guest_button"
                >
                  Continue as Guest
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
