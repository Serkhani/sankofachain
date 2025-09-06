"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ENSRegistrationModal, ENSNameDisplay, ENSQuickRegister } from "~~/components/ens";
import { Button, Card, CardContent } from "~~/components/ui";
import { useENSRegistration, useENSAvailability } from "~~/hooks/ens";

export default function ENSDemoPage() {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [testLabel, setTestLabel] = useState("");

  const { available, isLoading: checkingAvailability, error: availabilityError } = useENSAvailability(testLabel);
  const { registerBasic, isRegistering, error: registrationError } = useENSRegistration();

  const handleRegister = async () => {
    if (!testLabel) return;
    const result = await registerBasic(testLabel);
    if (result.success) {
      alert(`Successfully registered ${testLabel}.sankofachain.eth!`);
      setTestLabel("");
    } else {
      alert(`Registration failed: ${result.error}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              ENS Demo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please connect your wallet to test ENS functionality
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ENS Integration Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the SankofaChain ENS Registrar integration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Address Display */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Address</h2>
              <ENSNameDisplay
                address={address}
                showCopyButton={true}
                showExternalLink={true}
                className="text-lg"
              />
            </CardContent>
          </Card>

          {/* Quick Register */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Register</h2>
              <ENSQuickRegister
                onSuccess={(ensName) => {
                  alert(`Successfully registered ${ensName}!`);
                }}
              />
            </CardContent>
          </Card>

          {/* Manual Registration Test */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Test Registration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ENS Label
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={testLabel}
                      onChange={(e) => setTestLabel(e.target.value.toLowerCase())}
                      placeholder="alice"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md text-gray-600 dark:text-gray-300">
                      .sankofachain.eth
                    </span>
                  </div>
                </div>

                {testLabel && (
                  <div className="text-sm">
                    {checkingAvailability ? (
                      <div className="text-blue-600">Checking availability...</div>
                    ) : availabilityError ? (
                      <div className="text-red-600">{availabilityError}</div>
                    ) : available === true ? (
                      <div className="text-green-600">✓ Available</div>
                    ) : available === false ? (
                      <div className="text-red-600">✗ Already taken</div>
                    ) : null}
                  </div>
                )}

                <Button
                  onClick={handleRegister}
                  disabled={!testLabel || available !== true || isRegistering}
                  className="w-full"
                >
                  {isRegistering ? "Registering..." : "Register"}
                </Button>

                {registrationError && (
                  <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {registrationError}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Full Registration Modal */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Full Registration</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Register with additional profile information and text records.
              </p>
              <Button
                onClick={() => setShowModal(true)}
                className="w-full"
                variant="outline"
              >
                Open Registration Modal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contract Information */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Registrar Address:</strong>
                <br />
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  0x910DDfaf66627797fb7CD50e664568E84EBb0E1a
                </code>
              </div>
              <div>
                <strong>Registry Address:</strong>
                <br />
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  0x7bd23bf843970570908f2fdbfeb42fcf0da32bd5
                </code>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <strong>Network:</strong> Base Sepolia Testnet (Chain ID: 84532)
            </div>
          </CardContent>
        </Card>

        {/* ENS Registration Modal */}
        <ENSRegistrationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={(ensName) => {
            alert(`Successfully registered ${ensName}!`);
            setShowModal(false);
          }}
          userAddress={address || ""}
        />
      </div>
    </div>
  );
}
