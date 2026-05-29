<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BillCanceled extends Mailable
{
    use Queueable, SerializesModels;

    public $bill;
    public $name;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($bill, $name)
    {
        $this->bill = $bill;
        $this->name = $name;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        //        return $this->view('email.bill_assigned');
        return $this->markdown('vendor.mail.html.billcanceled')
            ->with(['bill' => $this->bill, 'name' => $this->name]);
    }
}