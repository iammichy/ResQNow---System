<?php

return [
    /*
     * Maximum time an assignment may remain unacknowledged
     * before ResQNow flags it for Admin attention.
     *
     * Five minutes is currently a configurable demo/default
     * value until Barangay Camunatan confirms its policy.
     */
    'assignment_acknowledgement_timeout_minutes' =>
        (int) env(
            'RESQNOW_ASSIGNMENT_ACK_TIMEOUT_MINUTES',
            5
        ),
];
