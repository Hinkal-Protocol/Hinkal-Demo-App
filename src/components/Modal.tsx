import { ReactNode } from "react";

interface ModalInterface {
  children: ReactNode;
  styleProps?: string;
  stylePropsBg?: string;
  xBtnStyleProps?: string;
  xBtn?: boolean;
  isOpen: boolean;
  xBtnAction?: () => object | void;
  scrollBody?: boolean;
}

export const Modal = ({
  children,
  styleProps,
  stylePropsBg,
  xBtnStyleProps,
  xBtn,
  isOpen,
  xBtnAction,
  scrollBody = true,
}: ModalInterface) => (
  <>
    {/* this div has onClick so that the popup closes if the user clicks outside of it */}
    <div
      className={`bg-[#000000a6] fixed top-0 left-0 w-full h-screen z-10 transition-opacity duration-300 ${stylePropsBg} ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      } `}
      onClick={xBtnAction}
    />
    <div
      className={`fixed w-[90%] bg-black border-[1px] border-solid border-hinkal-gray-400 rounded md:w-2/5 left-[5%] top-[20%] md:left-[30%] z-[100]
    max-h-[70vh] overflow-hidden flex flex-col
    ${styleProps}
    ${
      isOpen
        ? "opacity-[1] translate-y-[0%]"
        : "opacity-[0] translate-y-[-200%] pointer-events-none"
    } transition-all duration-500 `}
    >
      {xBtn && (
        <button
          type="button"
          className="absolute right-2 z-[1] font-bold cursor-pointer text-white translate-y-1.5"
          onClick={xBtnAction}
        >
          <i
            className={`bi bi-x text-[26px] hover:text-hinkal-white-300 transition-colors duration-300 ${xBtnStyleProps} `}
          />
        </button>
      )}

      {scrollBody ? (
        <div className="overflow-y-auto min-h-0">{children}</div>
      ) : (
        children
      )}
    </div>
  </>
);
