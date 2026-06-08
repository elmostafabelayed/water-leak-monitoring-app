<?php

namespace App\Http\Controllers\Api;

use App\Models\Sensor;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends BaseApiController
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return $this->failure($validator->errors()->first(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Sensor::create([
            'user_id' => $user->id,
            'name' => 'Capteur principal',
            'location' => 'Arrivée principale',
        ]);

        Setting::create([
            'user_id' => $user->id,
            'valve_mode' => 'auto',
            'push_notifications' => true,
            'email_alerts' => false,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success(['token' => $token, 'user' => $user], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->failure($validator->errors()->first(), 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->failure('Identifiants invalides', 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return $this->success(['logged_out' => true]);
    }

    public function me(Request $request)
    {
        return $this->success($request->user());
    }
}
