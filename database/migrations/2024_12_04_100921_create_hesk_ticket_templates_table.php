<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHeskTicketTemplatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('hesk_ticket_templates', function (Blueprint $table) {
            $table->smallIncrements('id'); 
            $table->string('title', 100)->default('');
            $table->mediumText('message');
            $table->mediumText('message_html')->nullable();
            $table->unsignedSmallInteger('tpl_order')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('hesk_ticket_templates');
    }
}
