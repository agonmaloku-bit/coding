<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContractCanceled extends Mailable
{
    use Queueable, SerializesModels;

    public $contract;
    public $name;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($contract, $name)
    {
        $this->contract = $contract;
        $this->name = $name;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
//        return $this->view('email.contract_assigned');
        return $this->markdown('vendor.mail.html.canceled')
            ->with(['contract' => $this->contract, 'name' => $this->name]);
    }
}
