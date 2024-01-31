<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth 클라이언트를 저장한다.
 *
 * @file /modules/member/processes/oauth.client.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if (
    $me
        ->getAdmin()
        ->getAdministrator()
        ?->isMaster() !== true
) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$oauth_id = Request::get('oauth_id');
if ($oauth_id !== null) {
    $client = $me
        ->db()
        ->select()
        ->from($me->table('oauth_clients'))
        ->where('oauth_id', $oauth_id)
        ->getOne();

    if ($client === null) {
        $results->success = false;
        $results->message = $me->getErrorText('NOT_FOUND_DATA');
        return;
    }
} else {
    $client = null;
}

$errors = [];
$oauth_id = Input::get('oauth_id', $errors);
$auth_url = Input::get('auth_url', $errors);
$token_url = Input::get('token_url', $errors);
$client_id = Input::get('client_id', $errors);
$client_secret = Input::get('client_secret', $errors);
$scope = Input::get('scope') ? explode("\n", Input::get('scope')) : [];
$scope_separator = Input::get('scope_separator') ?? ' ';
$user_url = Input::get('user_url', $errors);
$user_id_path = Input::get('user_id_path', $errors);
$user_email_path = Input::get('user_email_path', $errors);
$user_name_path = Input::get('user_name_path');
$user_nickname_path = Input::get('user_nickname_path', $errors);
$user_photo_path = Input::get('user_photo_path');
$allow_signup = Input::get('allow_signup') ? 'TRUE' : 'FALSE';

$scope = array_values(
    array_filter(array_unique($scope), function ($s) {
        return strlen(trim($s)) > 0;
    })
);

if (count($errors) == 0) {
    $checked = $me
        ->db()
        ->select()
        ->from($me->table('oauth_clients'))
        ->where('oauth_id', $oauth_id);
    if ($client !== null) {
        $checked->where('oauth_id', $client->oauth_id, '!=');
    }
    if ($checked->has() == true) {
        $errors['oauth_id'] = $me->getErrorText('DUPLICATED');
    }
}

if (count($errors) == 0) {
    $insert = [];
    $insert['oauth_id'] = $oauth_id;
    $insert['auth_url'] = $auth_url;
    $insert['token_url'] = $token_url;
    $insert['client_id'] = $client_id;
    $insert['client_secret'] = $client_secret;
    $insert['scope'] = count($scope) == 0 ? '' : implode("\n", $scope);
    $insert['scope_separator'] = $scope_separator;
    $insert['user_url'] = $user_url;
    $insert['user_id_path'] = $user_id_path;
    $insert['user_email_path'] = $user_email_path;
    $insert['user_name_path'] = $user_name_path;
    $insert['user_nickname_path'] = $user_nickname_path;
    $insert['user_photo_path'] = $user_photo_path;
    $insert['allow_signup'] = $allow_signup;

    if ($client === null) {
        $insert['sort'] = $me
            ->db()
            ->select()
            ->from($me->table('oauth_clients'))
            ->count();
        $me->db()
            ->replace($me->table('oauth_clients'), $insert)
            ->execute();
    } else {
        $me->db()
            ->update($me->table('oauth_clients'), $insert)
            ->where('oauth_id', $client->oauth_id)
            ->execute();
    }

    $results->success = false;
    $results->oauth_id = $oauth_id;
} else {
    $results->success = false;
    $results->errors = $errors;
}
