<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 로그인을 처리한다.
 *
 * @file /modules/member/process/login.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 8. 21.
 *
 * @var \modules\member\Member $me
 * @var Input $input
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

$errors = [];
$email = $input->get('email', $errors);
$password = $input->get('password', $errors);
$auto_login = $input->get('auto_login') === 'true';

if (count($errors) == 0) {
    $login = $me->login($email, $password, $auto_login);

    if ($login === true) {
        $results->success = true;
    } else {
        $results->success = false;
        $results->message = $login;
    }
} else {
    $results->success = false;
    $results->errors = $errors;
}
