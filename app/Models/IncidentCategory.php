<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentCategory extends Model
{
    use HasFactory;

    protected $table = 'incidentcategories';

    protected $fillable = ['name'];

    public $timestamps = false;
}
