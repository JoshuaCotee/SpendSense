import React, { createContext, useContext, useState, ReactNode } from "react";
import { ModalLayout } from "@components/modal/ModalLayout";

interface ModalContextType {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const openModal = (newContent: ReactNode) => {
    setContent(newContent);
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    setContent(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      <ModalLayout visible={visible} onClose={closeModal}>
        {content}
      </ModalLayout>
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};