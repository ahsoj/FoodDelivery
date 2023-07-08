import { Modal } from "antd";

export const PopUp = ({ ...props }) => {
  const { isModalOpen, handleModalOpen } = props;
  return (
    <Modal
      title="Vertically centered modal dialog"
      centered
      open={isModalOpen}
      onOk={() => handleModalOpen(false)}
      onCancel={() => handleModalOpen(false)}
    >
      <p>some contents...</p>
      <p>some contents...</p>
      <p>some contents...</p>
    </Modal>
  );
};
