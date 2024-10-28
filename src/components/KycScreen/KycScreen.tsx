import { KycVerificationStatus } from "valtest-com-try-new-build-v";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { ContinueWithAiPriseVerification } from "./ContinueWithAiPriseVerification";
import { MintAccessToken } from "./MintAccessToken";
import { PendingAiPriseVerification } from "./PendingAiPriseVerification";

const mintErrorHandler = (err: Error) => {
  toast.error(getErrorMessage(err));
};

const openAiPriseErrorHandler = () => {
  toast.error("Something went wrong, please try again later");
};

export const KycScreen = () => {
  const [isMuted, setIsMuted] = useState(true);

  const kycStatusChangedHandler = useCallback(
    (newKycStatus?: KycVerificationStatus) => {
      setIsMuted(false);
      if (newKycStatus === KycVerificationStatus.FAILED) {
        toast.error(
          "You failed verification. Unfortunately, you did not pass KYC/AML requirements.",
          {
            id: "You failed verification. Unfortunately, you did not pass KYC/AML requirements.",
          }
        );
      } else if (newKycStatus === KycVerificationStatus.PENDING) {
        toast.error("The verification failed. Please, try once again.", {
          id: "The verification failed. Please, try once again.",
        });
      }
    },
    []
  );

  const deactivateHandler = useCallback(() => {
    setIsMuted(true);
  }, [setIsMuted]);

  const mintSuccessHandler = useCallback(async () => {
    deactivateHandler();
    toast.success(
      "Access Token will be minted in several seconds. Please, wait before the deposit. "
    );
  }, [deactivateHandler]);

  // const {
  //   closeMinting,
  //   isAiPriseProcessing,
  //   kycStatus,
  //   mintToken,
  //   mintingTransactionStatus,
  //   openAiPrise,
  // } = useKyc({
  //   enabled: !isMuted,
  //   onKycStatusChanged: kycStatusChangedHandler,
  //   onAiPriseError: openAiPriseErrorHandler,
  //   onMintSuccess: mintSuccessHandler,
  //   onMintError: mintErrorHandler,
  // });

  // const cancelMintingHandler = useCallback(async () => {
  //   closeMinting();
  //   deactivateHandler();
  // }, [closeMinting, deactivateHandler]);

  return (
    <div>
      {/* {!isMuted && (
        <>
          <ContinueWithAiPriseVerification
            isShown={
              kycStatus === KycStatus.Awaiting || kycStatus === KycStatus.Failed
            }
            isDisabled={isAiPriseProcessing}
            onSubmit={openAiPrise}
            onClose={deactivateHandler}
          />
          <PendingAiPriseVerification
            isShown={kycStatus === KycStatus.Pending}
            onClose={deactivateHandler}
          />
          <MintAccessToken
            isShown={kycStatus === KycStatus.MintAccessToken}
            transactionStatus={mintingTransactionStatus}
            onMint={mintToken}
            onClose={cancelMintingHandler}
          />
        </>
      )} */}
    </div>
  );
};
