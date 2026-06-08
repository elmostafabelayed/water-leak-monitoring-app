<?php

namespace App\Http\Controllers\Api;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends BaseApiController
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $setting = Setting::firstOrCreate(
            ['user_id' => $userId],
            ['valve_mode' => 'auto', 'push_notifications' => true, 'email_alerts' => false]
        );

        return $this->success([
            'valve_mode' => $setting->valve_mode,
            'push_notifications' => (bool) $setting->push_notifications,
            'email_alerts' => (bool) $setting->email_alerts,
        ]);
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'valve_mode' => 'required|in:auto,manual',
            'push_notifications' => 'required|boolean',
            'email_alerts' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return $this->failure($validator->errors()->first(), 422);
        }

        $userId = $request->user()->id;
        $setting = Setting::firstOrCreate(
            ['user_id' => $userId],
            ['valve_mode' => 'auto', 'push_notifications' => true, 'email_alerts' => false]
        );

        $setting->update([
            'valve_mode' => $request->string('valve_mode')->toString(),
            'push_notifications' => (bool) $request->boolean('push_notifications'),
            'email_alerts' => (bool) $request->boolean('email_alerts'),
        ]);

        return $this->success([
            'valve_mode' => $setting->valve_mode,
            'push_notifications' => (bool) $setting->push_notifications,
            'email_alerts' => (bool) $setting->email_alerts,
        ]);
    }
}

