export enum OrderStatus {
    /**
     * Created : when the order has been created,but when the ticket it is trying to order has not been reserved
     */
    Created = 'created',
    /**
     * Cancelled : The ticket , current order is trying to reserve has already been reserved, 
     * or the user has cancelled the order
     * The order expired before payment
     */
    Cancelled = 'cancelled',
    /**
     * AwaitingPayment : the order has successfully reserved the ticket.
     */
    AwaitingPayment = 'awaiting:payment',
     /**
     * Complete : the order has successfully reserved the ticket and user has provided payment successfully.
     */
    Complete = 'complete'
}