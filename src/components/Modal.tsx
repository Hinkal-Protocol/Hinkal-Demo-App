import { ReactNode } from "react";

interface ModalInterface {
  children: ReactNode;
  styleProps?: string;
  stylePropsBg?: string;
  xBtnStyleProps?: string;
  xBtn?: boolean;
  isOpen: boolean;
  xBtnAction?: () => object | void;
}

export const Modal = ({
  children,
  styleProps,
  stylePropsBg,
  xBtnStyleProps,
  xBtn,
  isOpen,
  xBtnAction,
}: ModalInterface) => (
  <>
    {/* this div has onClick so that the popup closes if the user clicks outside of it */}
    <div
      className={`bg-[#000000a6] fixed top-0 left-0 w-full h-screen z-10 ${stylePropsBg} ${
        isOpen ? "block" : "hidden"
      } `}
      onClick={xBtnAction}
    />
    <div
      className={`fixed w-[90%] bg-black border-[1px] border-solid border-[#4d4d4d] rounded md:w-2/5 left-[5%] top-[20%] md:left-[30%] z-[100]
    max-h-[80vh] overflow-y-auto
    ${styleProps}
    ${
      isOpen
        ? "opacity-[1] translate-y-[0%]"
        : "opacity-[0] translate-y-[-200%]"
    } transition-all duration-500 `}
    >
      {xBtn && (
        <button
          type="button"
          className="absolute right-2 font-bold cursor-pointer text-white"
          onClick={xBtnAction}
        >
          <i
            className={`bi bi-x text-[26px] hover:text-[#acaaaa] ${xBtnStyleProps} `}
          />
        </button>
      )}

      {children}
    </div>
  </>
);
