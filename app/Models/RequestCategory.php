<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestCategory extends Model
{
    use HasFactory;

    protected $table = 'requestcategories';

    protected $fillable = ['name'];

    public $timestamps = false;
}
