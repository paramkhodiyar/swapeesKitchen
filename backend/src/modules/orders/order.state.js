export function canTransition(currentStatus, nextStatus, actor) {
    const transitions = {
        PENDING_ACCEPTANCE: {
            OWNER: ["ACCEPTED", "CANCELLED_BY_OWNER"],
            CUSTOMER: ["CANCELLED_BY_CUSTOMER"],
        },
        ACCEPTED: {
            OWNER: ["DELIVERED"],
            CUSTOMER: [],
        },
    };

    return transitions[currentStatus]?.[actor]?.includes(nextStatus);
}
