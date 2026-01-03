import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { ModalLayout } from "@components/modal/ModalLayout";

interface ModalContextType {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const openModal = useCallback((newContent: ReactNode) => {
    // Delay mounting by a frame for better animation batching
    requestAnimationFrame(() => {
      setContent(newContent);
      setVisible(true);
    });
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
    // Delay unmount slightly to allow exit animation to finish
    setTimeout(() => setContent(null), 200);
  }, []);

  const contextValue = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  return (
    <ModalContext.Provider value={contextValue}>
      {children}

      {content && (
        <ModalLayout visible={visible} onClose={closeModal}>
          {content}
        </ModalLayout>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
