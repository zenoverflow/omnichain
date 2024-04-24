import React, { useEffect, useState } from "react";
import { Modal } from "antd";

import { complexErrorObservable } from "../../state/watcher";

const _Modal: React.FC<{
    closeModal: () => any;
    title?: string;
    message: string;
}> = ({ closeModal, title, message }) => {
    return (
        <Modal
            title={<h3>{title || "Error"}</h3>}
            open={true}
            afterClose={closeModal}
            // onOk={handleApply}
            onCancel={closeModal}
            footer={() => <></>}
            // footer={(_, { OkBtn, CancelBtn }) => (
            //     <>
            //         {/* <CancelBtn />
            //         <OkBtn /> */}
            //     </>
            // )}
        >
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {message}
            </div>
        </Modal>
    );
};

export const ComplexErrorModal: React.FC = () => {
    const [message, setMessage] = useState<[string, string] | null>(null);

    useEffect(() => {
        const unsub = complexErrorObservable.subscribe((message) => {
            setMessage(message);
        });
        return () => {
            unsub();
        };
    });

    const handleCloseModal = () => {
        setMessage(null);
    };

    return (
        <>
            {message ? (
                <_Modal
                    closeModal={handleCloseModal}
                    title={message[0]}
                    message={message[1]}
                />
            ) : null}
        </>
    );
};
